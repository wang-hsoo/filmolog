import ApiClient from '../api/client';
import { i18n } from '../../i18n';
import { getTmdbLanguage } from '../../i18n/tmdbLocale';
import type { AppLocale } from '../../i18n/types';

import type {
  TmdbDiscoverMovieResponse,
  TmdbGenreListResponse,
  TmdbMovieDetail,
  TmdbPersonMovieCreditsResponse,
  TmdbSearchMovieResponse,
} from './types';

const client = new ApiClient({
  type: 'movie',
});

function tmdbLanguage() {
  return getTmdbLanguage(i18n.language as AppLocale);
}

/** 한국 OTT — GET /watch/providers/movie?watch_region=KR 기준 주요 provider */
const KR_WATCH_PROVIDER_IDS = [
  8, // Netflix
  97, // Watcha
  337, // Disney+
  350, // Apple TV
  119, // Amazon Prime Video
] as const;

const DISCOVER_PAGE_COUNT = 10;

export const getGenres = async (): Promise<TmdbGenreListResponse> => {
  const response = await client.instance.get<TmdbGenreListResponse>(
    '/genre/movie/list',
    { params: { language: tmdbLanguage() } },
  );
  return response.data;
};

/**
 * 선호 장르 + 한국 시청 가능 OTT 기준 discover
 * @param feedKey 화면 진입마다 바꿔 page/sort 조합을 로테이션
 */
export const discoverMoviesByGenres = async (
  genreIds: number[],
  feedKey: number,
): Promise<TmdbDiscoverMovieResponse> => {
  const page = (Math.abs(feedKey) % DISCOVER_PAGE_COUNT) + 1;
  const sortBy =
    feedKey % 2 === 0 ? 'popularity.desc' : 'vote_average.desc';

  const response = await client.instance.get<TmdbDiscoverMovieResponse>(
    '/discover/movie',
    {
      params: {
        language: tmdbLanguage(),
        region: 'KR',
        with_genres: genreIds.join('|'),
        sort_by: sortBy,
        page,
        'vote_count.gte': 50,
        'vote_average.gte': 6.0,
        include_adult: false,
        watch_region: 'KR',
        with_watch_providers: KR_WATCH_PROVIDER_IDS.join('|'),
        with_watch_monetization_types: 'flatrate|rent|buy',
      },
    },
  );

  return response.data;
};

/** @deprecated discoverMoviesByGenres 사용 */
export const getMovieGenres = discoverMoviesByGenres;

/** GET /search/movie — 영화 검색 */
export const searchMovies = async (
  query: string,
  page = 1,
): Promise<TmdbSearchMovieResponse> => {
  const trimmed = query.trim();

  if (!trimmed) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const response = await client.instance.get<TmdbSearchMovieResponse>(
    '/search/movie',
    {
      params: {
        language: tmdbLanguage(),
        region: 'KR',
        query: trimmed,
        page,
        include_adult: false,
      },
    },
  );

  return response.data;
};

/** GET /movie/{id} — 상세 + credits */
export const getMovieDetail = async (
  movieId: number,
): Promise<TmdbMovieDetail> => {
  const response = await client.instance.get<TmdbMovieDetail>(
    `/movie/${movieId}`,
    {
      params: {
        language: tmdbLanguage(),
        append_to_response: 'credits',
      },
    },
  );

  return response.data;
};

/** GET /person/{id}/movie_credits — 감독/배우 필모그래피 */
export const getPersonMovieCredits = async (
  personId: number,
): Promise<TmdbPersonMovieCreditsResponse> => {
  const response = await client.instance.get<TmdbPersonMovieCreditsResponse>(
    `/person/${personId}/movie_credits`,
    {
      params: { language: tmdbLanguage() },
    },
  );

  return response.data;
};

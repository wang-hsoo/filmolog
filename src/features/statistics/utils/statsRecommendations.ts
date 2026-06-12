import type {
  TmdbMovie,
  TmdbPersonMovieCredit,
  TmdbPersonMovieCreditsResponse,
} from '../../../lib/tmdb/types';

export type PersonRecommendRole = 'director' | 'cast';

const PERSON_RECOMMEND_LIMIT = 12;

function mapCreditToTmdbMovie(credit: TmdbPersonMovieCredit): TmdbMovie {
  return {
    id: credit.id,
    title: credit.title,
    original_title: credit.original_title ?? credit.title,
    overview: credit.overview ?? '',
    poster_path: credit.poster_path,
    backdrop_path: credit.backdrop_path ?? null,
    release_date: credit.release_date ?? '',
    vote_average: credit.vote_average ?? 0,
    vote_count: credit.vote_count ?? 0,
    popularity: credit.popularity ?? 0,
    genre_ids: credit.genre_ids ?? [],
    original_language: credit.original_language ?? '',
  };
}

function pickCreditsForRole(
  credits: TmdbPersonMovieCreditsResponse,
  role: PersonRecommendRole,
): TmdbPersonMovieCredit[] {
  if (role === 'director') {
    return credits.crew.filter(item => item.job === 'Director');
  }

  return credits.cast;
}

export function pickUnwatchedPersonMovies(
  credits: TmdbPersonMovieCreditsResponse | undefined,
  reviewedTmdbIds: Set<number>,
  role: PersonRecommendRole,
  limit = PERSON_RECOMMEND_LIMIT,
): TmdbMovie[] {
  if (!credits) {
    return [];
  }

  const seen = new Set<number>();
  const movies: TmdbMovie[] = [];

  const sorted = [...pickCreditsForRole(credits, role)].sort(
    (a, b) =>
      (b.popularity ?? 0) - (a.popularity ?? 0) ||
      (b.release_date ?? '').localeCompare(a.release_date ?? ''),
  );

  for (const credit of sorted) {
    if (seen.has(credit.id) || reviewedTmdbIds.has(credit.id)) {
      continue;
    }

    seen.add(credit.id);
    movies.push(mapCreditToTmdbMovie(credit));

    if (movies.length >= limit) {
      break;
    }
  }

  return movies;
}

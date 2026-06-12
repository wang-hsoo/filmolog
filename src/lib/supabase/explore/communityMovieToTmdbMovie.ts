import type { TmdbMovie } from '../../tmdb/types';

import type { CommunityMovieRow } from './types';

export function communityMovieToTmdbMovie(row: CommunityMovieRow): TmdbMovie {
  return {
    id: row.tmdb_id,
    title: row.title,
    original_title: row.title,
    overview: '',
    poster_path: row.poster_path,
    backdrop_path: null,
    release_date: '',
    vote_average: Number(row.avg_rating),
    vote_count: row.review_count,
    popularity: 0,
    genre_ids: [],
    original_language: '',
  };
}

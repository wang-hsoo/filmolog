import { getSupabaseClient } from '../client';

import type { CommunityMovieRow } from './types';

const DEFAULT_MIN_REVIEWS = 2;
const DEFAULT_LIMIT = 20;

function assertRows(data: unknown): CommunityMovieRow[] {
  return (data ?? []) as CommunityMovieRow[];
}

export async function getCommunityTopRatedForMe(
  minReviews = DEFAULT_MIN_REVIEWS,
  limit = DEFAULT_LIMIT,
) {
  const { data, error } = await getSupabaseClient().rpc(
    'get_community_top_rated_for_me',
    {
      p_min_reviews: minReviews,
      p_limit: limit,
    },
  );

  if (error) {
    throw error;
  }

  return assertRows(data);
}

export async function getCommunityTopRatedByGenres(
  genreIds: number[],
  excludeTmdbIds: number[] = [],
  minReviews = DEFAULT_MIN_REVIEWS,
  limit = DEFAULT_LIMIT,
) {
  const { data, error } = await getSupabaseClient().rpc(
    'get_community_top_rated_by_genres',
    {
      p_genre_ids: genreIds,
      p_min_reviews: minReviews,
      p_limit: limit,
      p_exclude_tmdb_ids: excludeTmdbIds,
    },
  );

  if (error) {
    throw error;
  }

  return assertRows(data);
}

export async function getTopRatedFromStats(
  excludeTmdbIds: number[] = [],
  minReviews = DEFAULT_MIN_REVIEWS,
  limit = DEFAULT_LIMIT,
) {
  const { data, error } = await getSupabaseClient().rpc(
    'get_top_rated_from_stats',
    {
      p_min_reviews: minReviews,
      p_limit: limit,
      p_exclude_tmdb_ids: excludeTmdbIds,
    },
  );

  if (error) {
    throw error;
  }

  return assertRows(data);
}

export async function getCommunityMostReviewed(
  excludeTmdbIds: number[] = [],
  limit = DEFAULT_LIMIT,
  days: number | null = null,
) {
  const { data, error } = await getSupabaseClient().rpc(
    'get_community_most_reviewed',
    {
      p_limit: limit,
      p_exclude_tmdb_ids: excludeTmdbIds,
      p_days: days,
    },
  );

  if (error) {
    throw error;
  }

  return assertRows(data);
}

export async function getCommunityMostCollected(
  excludeTmdbIds: number[] = [],
  limit = DEFAULT_LIMIT,
) {
  const { data, error } = await getSupabaseClient().rpc(
    'get_community_most_collected',
    {
      p_limit: limit,
      p_exclude_tmdb_ids: excludeTmdbIds,
    },
  );

  if (error) {
    throw error;
  }

  return assertRows(data);
}

export async function refreshMovieStats() {
  const { error } = await getSupabaseClient().rpc('refresh_movie_stats');

  if (error) {
    throw error;
  }
}

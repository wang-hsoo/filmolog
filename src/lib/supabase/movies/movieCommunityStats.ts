import { getSupabaseClient } from '../client';

export type MovieCommunityStats = {
  avgRating: number | null;
  reviewCount: number;
};

export async function getMovieCommunityStats(
  tmdbId: number,
): Promise<MovieCommunityStats> {
  const { data, error } = await getSupabaseClient()
    .from('reviews')
    .select('rating')
    .eq('tmdb_id', tmdbId);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const reviewCount = rows.length;

  if (reviewCount === 0) {
    return { avgRating: null, reviewCount: 0 };
  }

  const sum = rows.reduce(
    (total, row) => total + Number(row.rating),
    0,
  );

  return {
    avgRating: Math.round((sum / reviewCount) * 10) / 10,
    reviewCount,
  };
}

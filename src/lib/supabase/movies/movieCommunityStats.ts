import {
  emptyReactionCounts,
  isReactionKey,
  parseReactionKeysFromRow,
  type ReactionKey,
} from '../../../components/constants/reaction.constants';
import { getSupabaseClient } from '../client';

export type MovieCommunityStats = {
  avgRating: number | null;
  reviewCount: number;
  reactionCounts: Record<ReactionKey, number>;
  reactionTotal: number;
};

export async function getMovieCommunityStats(
  tmdbId: number,
): Promise<MovieCommunityStats> {
  const { data, error } = await getSupabaseClient()
    .from('reviews')
    .select('rating, reaction_keys, reaction_key')
    .eq('tmdb_id', tmdbId);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const reviewCount = rows.length;
  const reactionCounts = emptyReactionCounts();

  if (reviewCount === 0) {
    return {
      avgRating: null,
      reviewCount: 0,
      reactionCounts,
      reactionTotal: 0,
    };
  }

  let reactionTotal = 0;

  for (const row of rows) {
    const keys = parseReactionKeysFromRow(row.reaction_keys, row.reaction_key);

    for (const key of keys) {
      if (isReactionKey(key)) {
        reactionCounts[key] += 1;
        reactionTotal += 1;
      }
    }
  }

  const sum = rows.reduce(
    (total, row) => total + Number(row.rating),
    0,
  );

  return {
    avgRating: Math.round((sum / reviewCount) * 10) / 10,
    reviewCount,
    reactionCounts,
    reactionTotal,
  };
}

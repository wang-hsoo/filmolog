import type { TmdbMovieCredits } from './types';

/** 통계 집계에 쓰는 주연 billing 상한 */
export const CAST_SNAPSHOT_LIMIT = 5;

export type MoviePersonSnapshot = {
  id: number;
  name: string;
  order?: number;
};

export function extractDirectorSnapshots(
  credits: TmdbMovieCredits,
): MoviePersonSnapshot[] {
  const seen = new Set<number>();

  return credits.crew
    .filter(member => member.job === 'Director')
    .filter(member => {
      if (seen.has(member.id)) {
        return false;
      }
      seen.add(member.id);
      return true;
    })
    .map(member => ({ id: member.id, name: member.name }));
}

export function extractTopCastSnapshots(
  credits: TmdbMovieCredits,
  limit = CAST_SNAPSHOT_LIMIT,
): MoviePersonSnapshot[] {
  const seen = new Set<number>();

  return [...credits.cast]
    .sort((a, b) => a.order - b.order)
    .filter(member => {
      if (seen.has(member.id)) {
        return false;
      }
      seen.add(member.id);
      return true;
    })
    .slice(0, limit)
    .map(member => ({ id: member.id, name: member.name, order: member.order }));
}

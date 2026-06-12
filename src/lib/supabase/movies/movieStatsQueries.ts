import { useQuery } from '@tanstack/react-query';

import { getMovieCommunityStats } from './movieCommunityStats';

export function useGetMovieCommunityStats(tmdbId: number | null) {
  return useQuery({
    queryKey: ['movieCommunityStats', tmdbId],
    queryFn: () => getMovieCommunityStats(tmdbId!),
    enabled: tmdbId != null,
    staleTime: 30_000,
  });
}

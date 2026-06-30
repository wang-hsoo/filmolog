import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getUserReviewedMovies } from './movie';
import type { UserReviewedMovie } from './movie';

const USER_REVIEWED_MOVIES_STALE_MS = 5 * 60 * 1000;
const USER_REVIEWED_MOVIES_GC_MS = 30 * 60 * 1000;

export const userReviewedMoviesQueryKey = (userId: string) =>
  ['userReviewedMovies', userId] as const;

export function readCachedUserReviewedMovies(
  queryClient: ReturnType<typeof useQueryClient>,
  userId?: string,
): UserReviewedMovie[] | undefined {
  if (userId) {
    return queryClient.getQueryData<UserReviewedMovie[]>(
      userReviewedMoviesQueryKey(userId),
    );
  }

  const entries = queryClient.getQueriesData<UserReviewedMovie[]>({
    queryKey: ['userReviewedMovies'],
  });

  for (const [, data] of entries) {
    if (data !== undefined) {
      return data;
    }
  }

  return undefined;
}

export function useCachedUserReviewedMovies(userId?: string) {
  const queryClient = useQueryClient();

  return useMemo(
    () => readCachedUserReviewedMovies(queryClient, userId),
    [queryClient, userId],
  );
}

export const useGetUserReviewedMovies = (userId: string) => {
  return useQuery({
    queryKey: userReviewedMoviesQueryKey(userId),
    queryFn: () => getUserReviewedMovies(userId),
    enabled: !!userId,
    staleTime: USER_REVIEWED_MOVIES_STALE_MS,
    gcTime: USER_REVIEWED_MOVIES_GC_MS,
  });
};

/** @deprecated useGetUserReviewedMovies 사용 */
export const useGetUserMovies = useGetUserReviewedMovies;

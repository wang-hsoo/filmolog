import { useQuery } from '@tanstack/react-query';

import { getUserReviewedMovies } from './movie';

export const useGetUserReviewedMovies = (userId: string) => {
  return useQuery({
    queryKey: ['userReviewedMovies', userId],
    queryFn: () => getUserReviewedMovies(userId),
    enabled: !!userId,
  });
};

/** @deprecated useGetUserReviewedMovies 사용 */
export const useGetUserMovies = useGetUserReviewedMovies;

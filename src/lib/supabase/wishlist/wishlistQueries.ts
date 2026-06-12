import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '../../queryClient';

import {
  addToWishlist,
  isMovieInWishlist,
  removeFromWishlist,
  type WishlistMovieInput,
} from './wishlist';

export const wishlistKeys = {
  all: ['wishlist'] as const,
  status: (userId: string, tmdbId: number) =>
    [...wishlistKeys.all, 'status', userId, tmdbId] as const,
};

export function useIsInWishlist(userId: string, tmdbId: number) {
  return useQuery({
    queryKey: wishlistKeys.status(userId, tmdbId),
    queryFn: () => isMovieInWishlist(userId, tmdbId),
    enabled: !!userId && tmdbId > 0,
  });
}

export function useToggleWishlist() {
  return useMutation({
    mutationFn: async ({
      userId,
      tmdbId,
      isInWishlist,
      movie,
    }: {
      userId: string;
      tmdbId: number;
      isInWishlist: boolean;
      movie: Omit<WishlistMovieInput, 'userId' | 'tmdbId'>;
    }) => {
      if (isInWishlist) {
        await removeFromWishlist(userId, tmdbId);
        return false;
      }

      await addToWishlist({
        userId,
        tmdbId,
        ...movie,
      });
      return true;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: wishlistKeys.status(variables.userId, variables.tmdbId),
      });
      queryClient.invalidateQueries({
        queryKey: ['userStats', variables.userId],
      });
    },
  });
}

import { useMutation } from '@tanstack/react-query';

import { queryClient } from '../../queryClient';
import { createReview, type CreateReviewInput } from './review';

export const useCreateReview = () => {
  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['userReviewedMovies', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['userStats', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['collections', variables.userId],
      });
    },
  });
};

export type { CreateReviewInput };

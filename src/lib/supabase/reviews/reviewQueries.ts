import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '../../queryClient';
import {
  createReview,
  deleteReview,
  getReviewById,
  updateReview,
  type CreateReviewInput,
  type UpdateReviewInput,
} from './review';

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

export const useGetReview = (reviewId: string) => {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => getReviewById(reviewId),
    enabled: !!reviewId,
  });
};

export const useUpdateReview = () => {
  return useMutation({
    mutationFn: (input: UpdateReviewInput) => updateReview(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['review', variables.reviewId],
      });
      queryClient.invalidateQueries({ queryKey: ['userReviewedMovies'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['collectionDetail'] });
    },
  });
};

export const useDeleteReview = () => {
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: (_data, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['userReviewedMovies'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['collectionDetail'] });
      queryClient.invalidateQueries({ queryKey: ['collectionList'] });
    },
  });
};

export type { CreateReviewInput, UpdateReviewInput };

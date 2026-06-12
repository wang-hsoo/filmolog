import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useGetUserReviewedMovies } from '../users/movieQueries';

import { communityMovieToTmdbMovie } from './communityMovieToTmdbMovie';
import {
  getCommunityMostCollected,
  getCommunityMostReviewed,
  getCommunityTopRatedByGenres,
  getCommunityTopRatedForMe,
  getTopRatedFromStats,
} from './communityExplore';

const COMMUNITY_STALE_TIME = 60_000;

export const communityExploreKeys = {
  all: ['communityExplore'] as const,
  topRatedForMe: (userId: string) =>
    [...communityExploreKeys.all, 'topRatedForMe', userId] as const,
  topRatedByGenres: (userId: string, genreIds: number[]) =>
    [
      ...communityExploreKeys.all,
      'topRatedByGenres',
      userId,
      genreIds.join(','),
    ] as const,
  topRatedFromStats: (userId: string) =>
    [...communityExploreKeys.all, 'topRatedFromStats', userId] as const,
  mostReviewed: (userId: string, excludeKey: string) =>
    [...communityExploreKeys.all, 'mostReviewed', userId, excludeKey] as const,
  mostCollected: (userId: string, excludeKey: string) =>
    [...communityExploreKeys.all, 'mostCollected', userId, excludeKey] as const,
};

function useReviewedTmdbIds(userId: string) {
  const { data: reviewedMovies = [], isLoading } =
    useGetUserReviewedMovies(userId);

  const excludeTmdbIds = useMemo(
    () => reviewedMovies.map(movie => movie.tmdbId),
    [reviewedMovies],
  );

  return { excludeTmdbIds, isReviewedLoading: isLoading };
}

export function useCommunityTopRatedForMe(userId: string) {
  return useQuery({
    queryKey: communityExploreKeys.topRatedForMe(userId),
    queryFn: async () => {
      const rows = await getCommunityTopRatedForMe();
      return rows.map(communityMovieToTmdbMovie);
    },
    enabled: !!userId,
    staleTime: COMMUNITY_STALE_TIME,
  });
}

export function useCommunityTopRatedByGenres(
  userId: string,
  genreIds: number[],
) {
  const { excludeTmdbIds, isReviewedLoading } = useReviewedTmdbIds(userId);

  return useQuery({
    queryKey: communityExploreKeys.topRatedByGenres(userId, genreIds),
    queryFn: async () => {
      const rows = await getCommunityTopRatedByGenres(genreIds, excludeTmdbIds);
      return rows.map(communityMovieToTmdbMovie);
    },
    enabled: !!userId && genreIds.length > 0 && !isReviewedLoading,
    staleTime: COMMUNITY_STALE_TIME,
  });
}

export function useTopRatedFromStats(userId: string) {
  const { excludeTmdbIds, isReviewedLoading } = useReviewedTmdbIds(userId);

  return useQuery({
    queryKey: communityExploreKeys.topRatedFromStats(userId),
    queryFn: async () => {
      const rows = await getTopRatedFromStats(excludeTmdbIds);
      return rows.map(communityMovieToTmdbMovie);
    },
    enabled: !!userId && !isReviewedLoading,
    staleTime: COMMUNITY_STALE_TIME,
  });
}

export function useCommunityMostReviewed(userId: string) {
  const { excludeTmdbIds, isReviewedLoading } = useReviewedTmdbIds(userId);

  return useQuery({
    queryKey: communityExploreKeys.mostReviewed(
      userId,
      excludeTmdbIds.join(','),
    ),
    queryFn: async () => {
      const rows = await getCommunityMostReviewed(excludeTmdbIds);
      return rows.map(communityMovieToTmdbMovie);
    },
    enabled: !!userId && !isReviewedLoading,
    staleTime: COMMUNITY_STALE_TIME,
  });
}

export function useCommunityMostCollected(userId: string) {
  const { excludeTmdbIds, isReviewedLoading } = useReviewedTmdbIds(userId);

  return useQuery({
    queryKey: communityExploreKeys.mostCollected(
      userId,
      excludeTmdbIds.join(','),
    ),
    queryFn: async () => {
      const rows = await getCommunityMostCollected(excludeTmdbIds);
      return rows.map(communityMovieToTmdbMovie);
    },
    enabled: !!userId && !isReviewedLoading,
    staleTime: COMMUNITY_STALE_TIME,
  });
}

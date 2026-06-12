import { useMemo } from 'react';

import { useGetUserReviewedMovies } from '../../../lib/supabase';
import { usePersonMovieCredits } from '../../../lib/tmdb';

import { pickUnwatchedPersonMovies } from '../utils/statsRecommendations';
import {
  buildCastRankings,
  buildDirectorRankings,
} from '../utils/reviewStats';

export function useStatsPersonRecommendations(userId: string) {
  const { data: reviews = [] } = useGetUserReviewedMovies(userId);

  const { rankings: directorRankings } = useMemo(
    () => buildDirectorRankings(reviews),
    [reviews],
  );

  const { rankings: castRankings } = useMemo(
    () => buildCastRankings(reviews),
    [reviews],
  );

  const topDirector = directorRankings[0] ?? null;
  const topCast = castRankings[0] ?? null;

  const reviewedTmdbIds = useMemo(
    () => new Set(reviews.map(review => review.tmdbId)),
    [reviews],
  );

  const {
    data: topDirectorCredits,
    isLoading: isDirectorCreditsLoading,
    isError: isDirectorCreditsError,
  } = usePersonMovieCredits(topDirector?.personId ?? null);

  const {
    data: topCastCredits,
    isLoading: isCastCreditsLoading,
    isError: isCastCreditsError,
  } = usePersonMovieCredits(topCast?.personId ?? null);

  const directorRecommendMovies = useMemo(
    () =>
      pickUnwatchedPersonMovies(
        topDirectorCredits,
        reviewedTmdbIds,
        'director',
      ),
    [reviewedTmdbIds, topDirectorCredits],
  );

  const castRecommendMovies = useMemo(
    () =>
      pickUnwatchedPersonMovies(topCastCredits, reviewedTmdbIds, 'cast'),
    [reviewedTmdbIds, topCastCredits],
  );

  return {
    topDirector,
    topCast,
    directorRecommendMovies,
    castRecommendMovies,
    isDirectorCreditsLoading,
    isDirectorCreditsError,
    isCastCreditsLoading,
    isCastCreditsError,
  };
}

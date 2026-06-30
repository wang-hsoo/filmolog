import FastImage from 'react-native-fast-image';

import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';

import { filterReviewsInMonth } from './reviewLogUtils';

export function prefetchReviewPosterUris(uris: string[]) {
  const uniqueUris = [...new Set(uris.filter(Boolean))];

  if (uniqueUris.length === 0) {
    return;
  }

  FastImage.preload(
    uniqueUris.map(uri => ({
      uri,
      priority: FastImage.priority.high,
    })),
  );
}

export function prefetchMonthReviewPosters(
  reviews: UserReviewedMovie[],
  visibleMonth: Date,
  size: 'w154' | 'w342' = 'w154',
) {
  const monthReviews = filterReviewsInMonth(reviews, visibleMonth);
  const uris = monthReviews.flatMap(review => {
    const primary = getTmdbPosterUrl(review.posterPath, size);
    return primary ? [primary] : [];
  });

  prefetchReviewPosterUris(uris);
}

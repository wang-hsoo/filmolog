import {
  addDays,
  startOfDay,
  toDateOnlyString,
} from '../../filmLog/utils/date';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';

export type ReviewSortKey =
  | 'latest'
  | 'oldest'
  | 'ratingDesc'
  | 'ratingAsc'
  | 'watchedDesc';

export type ReviewLogViewMode = 'list' | 'timeline' | 'calendar';

export type ReviewLogPeriodKey =
  | 'all'
  | 'thisMonth'
  | 'last30'
  | 'last90'
  | 'thisYear';

export const REVIEW_SORT_OPTIONS: { key: ReviewSortKey; label: string }[] = [
  { key: 'latest', label: '최신 기록순' },
  { key: 'oldest', label: '오래된 기록순' },
  { key: 'ratingDesc', label: '평점 높은순' },
  { key: 'ratingAsc', label: '평점 낮은순' },
  { key: 'watchedDesc', label: '관람일 최신순' },
];

export const REVIEW_VIEW_OPTIONS: { key: ReviewLogViewMode; label: string }[] = [
  { key: 'list', label: '목록' },
  { key: 'timeline', label: '타임라인' },
  { key: 'calendar', label: '캘린더' },
];

export const REVIEW_PERIOD_OPTIONS: { key: ReviewLogPeriodKey; label: string }[] =
  [
    { key: 'all', label: '전체 기간' },
    { key: 'thisMonth', label: '이번 달' },
    { key: 'last30', label: '최근 30일' },
    { key: 'last90', label: '최근 3개월' },
    { key: 'thisYear', label: '올해' },
  ];

export type ReviewLogDateGroup = {
  dateKey: string;
  reviews: UserReviewedMovie[];
};

export function getReviewDateKey(review: UserReviewedMovie) {
  return review.watchedDate ?? review.createdAt.slice(0, 10);
}

export function sortReviews(
  items: UserReviewedMovie[],
  sortKey: ReviewSortKey,
): UserReviewedMovie[] {
  const sorted = [...items];

  switch (sortKey) {
    case 'latest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case 'ratingDesc':
      return sorted.sort(
        (a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt),
      );
    case 'ratingAsc':
      return sorted.sort(
        (a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt),
      );
    case 'watchedDesc':
      return sorted.sort((a, b) => {
        const aDate = getReviewDateKey(a);
        const bDate = getReviewDateKey(b);
        return bDate.localeCompare(aDate);
      });
    default:
      return sorted;
  }
}

export function filterReviewsByPeriod(
  reviews: UserReviewedMovie[],
  periodKey: ReviewLogPeriodKey,
) {
  if (periodKey === 'all') {
    return reviews;
  }

  const today = startOfDay(new Date());
  const todayKey = toDateOnlyString(today);

  switch (periodKey) {
    case 'thisMonth': {
      const prefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      return reviews.filter(review => getReviewDateKey(review).startsWith(prefix));
    }
    case 'last30': {
      const cutoff = toDateOnlyString(addDays(today, -29));
      return reviews.filter(review => getReviewDateKey(review) >= cutoff);
    }
    case 'last90': {
      const cutoff = toDateOnlyString(addDays(today, -89));
      return reviews.filter(review => getReviewDateKey(review) >= cutoff);
    }
    case 'thisYear': {
      const prefix = `${today.getFullYear()}-`;
      return reviews.filter(review => getReviewDateKey(review).startsWith(prefix));
    }
    default:
      return reviews;
  }
}

export function groupReviewsByDate(
  reviews: UserReviewedMovie[],
  sortKey: ReviewSortKey,
): ReviewLogDateGroup[] {
  const timelineSort: ReviewSortKey =
    sortKey === 'oldest' ? 'oldest' : 'watchedDesc';
  const sorted = sortReviews(reviews, timelineSort);
  const groups = new Map<string, UserReviewedMovie[]>();

  for (const review of sorted) {
    const dateKey = getReviewDateKey(review);
    const bucket = groups.get(dateKey) ?? [];
    bucket.push(review);
    groups.set(dateKey, bucket);
  }

  return [...groups.entries()]
    .sort(([a], [b]) =>
      timelineSort === 'oldest' ? a.localeCompare(b) : b.localeCompare(a),
    )
    .map(([dateKey, bucket]) => ({
      dateKey,
      reviews: bucket,
    }));
}

export function filterReviewsInMonth(
  reviews: UserReviewedMovie[],
  monthDate: Date,
) {
  const prefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  return reviews.filter(review => getReviewDateKey(review).startsWith(prefix));
}

export function filterReviewsOnDate(
  reviews: UserReviewedMovie[],
  dateKey: string,
) {
  return reviews.filter(review => getReviewDateKey(review) === dateKey);
}

export function getReviewDatesSet(reviews: UserReviewedMovie[]) {
  return new Set(reviews.map(getReviewDateKey));
}

export function indexReviewsByDate(reviews: UserReviewedMovie[]) {
  const map = new Map<string, UserReviewedMovie[]>();

  for (const review of reviews) {
    const dateKey = getReviewDateKey(review);
    const bucket = map.get(dateKey) ?? [];
    bucket.push(review);
    map.set(dateKey, bucket);
  }

  return map;
}

export function isDateInMonth(dateKey: string, monthDate: Date) {
  const prefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  return dateKey.startsWith(prefix);
}

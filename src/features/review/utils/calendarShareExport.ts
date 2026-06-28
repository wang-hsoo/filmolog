import type { TFunction } from 'i18next';

import { getWeekdayLabels } from '../../../i18n/labels';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';
import {
  buildCalendarCells,
  isAfterDay,
  isSameDay,
  isSameMonth,
  startOfDay,
  toDateOnlyString,
} from '../../filmLog/utils/date';

import type {
  CalendarShareDayCell,
  ReviewCalendarShareCardProps,
} from '../components/ReviewCalendarShareCard';

import {
  filterReviewsInMonth,
  getReviewDateKey,
  indexReviewsByDate,
} from './reviewLogUtils';

export type CalendarShareModel = {
  canExport: boolean;
  shareMessage: string;
  shareCardProps: ReviewCalendarShareCardProps;
  monthProgress: {
    reviewCount: number;
    filledDays: number;
    eligibleDays: number;
    ratio: number;
  };
};

type BuildCalendarShareModelInput = {
  reviews: UserReviewedMovie[];
  visibleMonth: Date;
  today?: Date;
  t: TFunction;
  i18nLanguage: string;
  footerTagline: string;
};

export function buildCalendarShareModel({
  reviews,
  visibleMonth,
  today = startOfDay(new Date()),
  t,
  i18nLanguage,
  footerTagline,
}: BuildCalendarShareModelInput): CalendarShareModel {
  const reviewsByDate = indexReviewsByDate(reviews);
  const cells = buildCalendarCells(visibleMonth, today);
  const monthReviews = filterReviewsInMonth(reviews, visibleMonth);

  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const isCurrentMonth = isSameMonth(visibleMonth, today);
  const eligibleDays = isCurrentMonth ? today.getDate() : daysInMonth;
  const filledDays = new Set(
    monthReviews.map(review => getReviewDateKey(review)),
  ).size;
  const ratio = eligibleDays > 0 ? filledDays / eligibleDays : 0;
  const reviewCount = monthReviews.length;

  const shareDays: CalendarShareDayCell[] = cells.map(cell => {
    if (!cell.date) {
      return {
        key: cell.key,
        day: null,
        posterUri: null,
        reviewCount: 0,
        isToday: false,
        isFuture: false,
      };
    }

    const dateKey = toDateOnlyString(cell.date);
    const dayBucket = reviewsByDate.get(dateKey) ?? [];

    return {
      key: cell.key,
      day: cell.date.getDate(),
      posterUri:
        getTmdbPosterUrl(dayBucket[0]?.posterPath ?? null, 'w154') ?? null,
      reviewCount: dayBucket.length,
      isToday: isSameDay(cell.date, today),
      isFuture: isAfterDay(cell.date, today),
    };
  });

  const highlightPosterUris: string[] = [];
  const seen = new Set<string>();

  for (const review of monthReviews) {
    const uri = getTmdbPosterUrl(review.posterPath, 'w154');

    if (!uri || seen.has(uri)) {
      continue;
    }

    seen.add(uri);
    highlightPosterUris.push(uri);

    if (highlightPosterUris.length >= 5) {
      break;
    }
  }

  const shareMonthTitle = t('common.calendar.yearMonth', {
    year: visibleMonth.getFullYear(),
    month: visibleMonth.getMonth() + 1,
  });

  const shareMonthLabel = new Intl.DateTimeFormat(
    i18nLanguage === 'en' ? 'en-US' : 'ko-KR',
    { month: 'long' },
  ).format(visibleMonth);

  const shareProgressLabel = t('common.units.monthProgress', {
    filledDays,
    eligibleDays,
    reviewCount,
  });

  const shareCaptionLabel =
    ratio >= 1
      ? t('review.calendar.monthComplete')
      : t('review.calendar.tagline');

  return {
    canExport: reviewCount > 0,
    shareMessage: t('review.calendar.shareMessage', {
      year: visibleMonth.getFullYear(),
      month: visibleMonth.getMonth() + 1,
      count: reviewCount,
    }),
    monthProgress: {
      reviewCount,
      filledDays,
      eligibleDays,
      ratio,
    },
    shareCardProps: {
      monthTitle: shareMonthTitle,
      yearLabel: String(visibleMonth.getFullYear()),
      monthLabel: shareMonthLabel,
      progressLabel: shareProgressLabel,
      captionLabel: shareCaptionLabel,
      weekdayLabels: getWeekdayLabels(t),
      days: shareDays,
      filmCountLabel: t('common.units.filmCount', { count: reviewCount }),
      footerTagline,
      highlightPosterUris,
    },
  };
}

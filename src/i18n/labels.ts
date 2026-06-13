import type { TFunction } from 'i18next';

import type { BadgeCategory, BadgeId } from '../components/constants/badge.constants';
import type {
  ReviewLogPeriodKey,
  ReviewLogViewMode,
  ReviewSortKey,
} from '../features/review/utils/reviewLogUtils';

export type { ReviewLogPeriodKey, ReviewLogViewMode, ReviewSortKey };

export function getStatsLabel(
  t: TFunction,
  key: 'avgRating' | 'reviewCount' | 'wishlistCount' | 'collectionCount',
) {
  return t(`common.stats.${key}`);
}

export function getBadgeName(t: TFunction, id: BadgeId) {
  return t(`badges.items.${id}.name`);
}

export function getBadgeDescription(t: TFunction, id: BadgeId) {
  return t(`badges.items.${id}.description`);
}

export function getBadgeCategoryLabel(t: TFunction, category: BadgeCategory) {
  return t(`badges.categories.${category}`);
}

const REVIEW_SORT_I18N: Record<ReviewSortKey, string> = {
  latest: 'common.sort.latestLog',
  oldest: 'common.sort.oldestLog',
  ratingDesc: 'common.sort.ratingDesc',
  ratingAsc: 'common.sort.ratingAsc',
  watchedDesc: 'common.sort.watchedDesc',
};

export function getReviewSortOptions(t: TFunction) {
  return (Object.keys(REVIEW_SORT_I18N) as ReviewSortKey[]).map(key => ({
    key,
    label: t(REVIEW_SORT_I18N[key]),
  }));
}

export function getReviewViewOptions(t: TFunction) {
  return (['list', 'timeline', 'calendar'] as ReviewLogViewMode[]).map(key => ({
    key,
    label: t(`common.viewMode.${key}`),
  }));
}

export function getReviewPeriodOptions(t: TFunction) {
  return (
    ['all', 'thisMonth', 'last30', 'last90', 'thisYear'] as ReviewLogPeriodKey[]
  ).map(key => ({
    key,
    label: t(`common.period.${key}`),
  }));
}

export function getWeekdayLabels(t: TFunction) {
  return [
    t('common.calendar.weekdays.sun'),
    t('common.calendar.weekdays.mon'),
    t('common.calendar.weekdays.tue'),
    t('common.calendar.weekdays.wed'),
    t('common.calendar.weekdays.thu'),
    t('common.calendar.weekdays.fri'),
    t('common.calendar.weekdays.sat'),
  ];
}

export function formatRuntimeLocalized(
  t: TFunction,
  minutes: number | null | undefined,
) {
  if (!minutes || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return t('common.movieMeta.runtimeMinutes', { minutes: mins });
  }

  if (mins === 0) {
    return t('common.movieMeta.runtimeHours', { hours });
  }

  return t('common.movieMeta.runtimeHoursMinutes', { hours, minutes: mins });
}

export function formatWatchedDateWithWeekdayLocalized(
  t: TFunction,
  dateStr: string | null,
) {
  if (!dateStr) {
    return null;
  }

  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month || !day) {
    return dateStr.replace(/-/g, '.');
  }

  const date = new Date(year, month - 1, day);
  const weekdays = getWeekdayLabels(t);

  return `${String(year).padStart(4, '0')}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${weekdays[date.getDay()]})`;
}

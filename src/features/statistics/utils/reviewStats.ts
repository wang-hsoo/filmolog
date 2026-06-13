import { normalizeReviewRating } from '../../filmLog/utils/rating';
import { i18n } from '../../../i18n';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';

export type MonthlyCount = {
  key: string;
  label: string;
  count: number;
};

export type RatingBucket = {
  label: string;
  count: number;
};

export type GenreSlice = {
  genreId: number;
  label: string;
  count: number;
  color: string;
  percent: number;
};

export type PersonRank = {
  personId: number;
  name: string;
  count: number;
};

export const GENRE_CHART_COLORS = [
  '#B8956B',
  '#D9C4A0',
  '#8A7052',
  '#C4A882',
  '#A68B62',
  '#5E5348',
  '#7A6F63',
  '#D4B896',
] as const;

function getReviewDate(review: UserReviewedMovie): Date {
  const raw = review.watchedDate ?? review.createdAt.slice(0, 10);
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date(review.createdAt) : date;
}

function formatMonthKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatMonthLabel(key: string) {
  const [, month] = key.split('-');
  return i18n.t('common.movieMeta.monthLabel', {
    month: Number.parseInt(month, 10),
  });
}

export function buildMonthlyCounts(
  reviews: UserReviewedMovie[],
  monthCount = 6,
): MonthlyCount[] {
  const now = new Date();
  const keys: string[] = [];

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(formatMonthKey(date));
  }

  const counts = new Map(keys.map(key => [key, 0]));

  for (const review of reviews) {
    const key = formatMonthKey(getReviewDate(review));
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return keys.map(key => ({
    key,
    label: formatMonthLabel(key),
    count: counts.get(key) ?? 0,
  }));
}

export function buildRatingBuckets(reviews: UserReviewedMovie[]): RatingBucket[] {
  const stars = [1, 2, 3, 4, 5] as const;
  const counts = new Map<number, number>(stars.map(star => [star, 0]));

  for (const review of reviews) {
    const star = Math.min(
      5,
      Math.max(1, Math.round(normalizeReviewRating(review.rating))),
    );
    counts.set(star, (counts.get(star) ?? 0) + 1);
  }

  return stars.map(star => ({
    label: i18n.t('common.movieMeta.ratingPoint', { star }),
    count: counts.get(star) ?? 0,
  }));
}

export function buildGenreSlices(
  reviews: UserReviewedMovie[],
  genreNameById: Map<number, string>,
  limit = 6,
): { slices: GenreSlice[]; missingGenreReviewCount: number } {
  const counts = new Map<number, number>();
  let missingGenreReviewCount = 0;

  for (const review of reviews) {
    const genreIds = review.genreIds ?? [];
    if (genreIds.length === 0) {
      missingGenreReviewCount += 1;
      continue;
    }

    for (const genreId of genreIds) {
      counts.set(genreId, (counts.get(genreId) ?? 0) + 1);
    }
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return { slices: [], missingGenreReviewCount };
  }

  const slices = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genreId, count], index) => ({
      genreId,
      label: genreNameById.get(genreId) ?? i18n.t('common.movieMeta.fallbackGenre', { id: genreId }),
      count,
      color: GENRE_CHART_COLORS[index % GENRE_CHART_COLORS.length],
      percent: Math.round((count / total) * 100),
    }));

  return { slices, missingGenreReviewCount };
}

function buildPersonRankings(
  reviews: UserReviewedMovie[],
  getPeople: (review: UserReviewedMovie) => { id: number; name: string }[],
  limit = 5,
): { rankings: PersonRank[]; missingReviewCount: number } {
  const counts = new Map<number, { name: string; count: number }>();
  let missingReviewCount = 0;

  for (const review of reviews) {
    const people = getPeople(review);
    if (people.length === 0) {
      missingReviewCount += 1;
      continue;
    }

    const seenInReview = new Set<number>();
    for (const person of people) {
      if (seenInReview.has(person.id)) {
        continue;
      }
      seenInReview.add(person.id);

      const existing = counts.get(person.id);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(person.id, { name: person.name, count: 1 });
      }
    }
  }

  const rankings = [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([personId, { name, count }]) => ({ personId, name, count }));

  return { rankings, missingReviewCount };
}

export function buildDirectorRankings(
  reviews: UserReviewedMovie[],
  limit = 5,
) {
  return buildPersonRankings(reviews, review => review.directors ?? [], limit);
}

export function buildCastRankings(reviews: UserReviewedMovie[], limit = 5) {
  return buildPersonRankings(reviews, review => review.topCast ?? [], limit);
}

export function countReviewsThisMonth(reviews: UserReviewedMovie[]): number {
  const now = new Date();
  const currentKey = formatMonthKey(now);

  return reviews.filter(
    review => formatMonthKey(getReviewDate(review)) === currentKey,
  ).length;
}

export function countReviewsLastDays(
  reviews: UserReviewedMovie[],
  days: number,
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);

  return reviews.filter(review => getReviewDate(review) >= cutoff).length;
}

export function getTopRatedReviews(
  reviews: UserReviewedMovie[],
  limit = 3,
): UserReviewedMovie[] {
  return [...reviews]
    .sort(
      (a, b) =>
        normalizeReviewRating(b.rating) - normalizeReviewRating(a.rating) ||
        getReviewDate(b).getTime() - getReviewDate(a).getTime(),
    )
    .slice(0, limit);
}

export type DecadeCount = {
  key: string;
  label: string;
  count: number;
};

export type GenreRatingStat = {
  genreId: number;
  label: string;
  avgRating: number;
  count: number;
};

export type PreferredGenreStat = {
  genreId: number;
  label: string;
  actualCount: number;
};

export type JournalStats = {
  totalReviews: number;
  withContentCount: number;
  contentRate: number;
  avgContentLength: number;
};

export type YearSummary = {
  year: number;
  count: number;
  avgRating: number;
  previousYearCount: number;
};

function hasReviewContent(content: string | null): boolean {
  return Boolean(content?.trim());
}

function formatDecadeLabel(decadeStart: number) {
  return i18n.t('common.movieMeta.decadeLabel', { decade: decadeStart });
}

export function buildDecadeCounts(
  reviews: UserReviewedMovie[],
): { items: DecadeCount[]; missingReleaseYearCount: number } {
  const counts = new Map<string, number>();
  let missingReleaseYearCount = 0;

  for (const review of reviews) {
    const year = review.releaseYear;
    if (year == null || !Number.isFinite(year)) {
      missingReleaseYearCount += 1;
      continue;
    }

    const decadeStart = Math.floor(year / 10) * 10;
    const key = String(decadeStart);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const items = [...counts.entries()]
    .sort((a, b) => Number.parseInt(a[0], 10) - Number.parseInt(b[0], 10))
    .map(([key, count]) => ({
      key,
      label: formatDecadeLabel(Number.parseInt(key, 10)),
      count,
    }));

  return { items, missingReleaseYearCount };
}

export function buildGenreRatingStats(
  reviews: UserReviewedMovie[],
  genreNameById: Map<number, string>,
  minCount = 2,
  limit = 5,
): GenreRatingStat[] {
  const totals = new Map<number, { sum: number; count: number }>();

  for (const review of reviews) {
    const genreIds = review.genreIds ?? [];
    if (genreIds.length === 0) {
      continue;
    }

    const seen = new Set<number>();
    for (const genreId of genreIds) {
      if (seen.has(genreId)) {
        continue;
      }
      seen.add(genreId);

      const existing = totals.get(genreId);
      if (existing) {
        existing.sum += normalizeReviewRating(review.rating);
        existing.count += 1;
      } else {
        totals.set(genreId, {
          sum: normalizeReviewRating(review.rating),
          count: 1,
        });
      }
    }
  }

  return [...totals.entries()]
    .filter(([, { count }]) => count >= minCount)
    .map(([genreId, { sum, count }]) => ({
      genreId,
      label: genreNameById.get(genreId) ?? i18n.t('common.movieMeta.fallbackGenre', { id: genreId }),
      avgRating: sum / count,
      count,
    }))
    .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count)
    .slice(0, limit);
}

export function buildPreferredGenreStats(
  preferredGenreIds: number[],
  reviews: UserReviewedMovie[],
  genreNameById: Map<number, string>,
): PreferredGenreStat[] {
  if (preferredGenreIds.length === 0) {
    return [];
  }

  const actualCounts = new Map<number, number>();

  for (const review of reviews) {
    for (const genreId of review.genreIds ?? []) {
      actualCounts.set(genreId, (actualCounts.get(genreId) ?? 0) + 1);
    }
  }

  return preferredGenreIds
    .map(genreId => ({
      genreId,
      label: genreNameById.get(genreId) ?? i18n.t('common.movieMeta.fallbackGenre', { id: genreId }),
      actualCount: actualCounts.get(genreId) ?? 0,
    }))
    .sort((a, b) => b.actualCount - a.actualCount);
}

export function getPreferredGenreInsight(
  preferredStats: PreferredGenreStat[],
): string | null {
  if (preferredStats.length === 0) {
    return null;
  }

  const watched = preferredStats.filter(stat => stat.actualCount > 0);
  if (watched.length === 0) {
    return i18n.t('statistics.insights.preferredGenreEmpty');
  }

  const top = watched[0];
  return i18n.t('statistics.insights.preferredGenreTop', { genre: top.label });
}

export function buildJournalStats(reviews: UserReviewedMovie[]): JournalStats {
  const totalReviews = reviews.length;
  const withContent = reviews.filter(review => hasReviewContent(review.content));
  const totalLength = withContent.reduce(
    (sum, review) => sum + (review.content?.trim().length ?? 0),
    0,
  );

  return {
    totalReviews,
    withContentCount: withContent.length,
    contentRate:
      totalReviews > 0
        ? Math.round((withContent.length / totalReviews) * 100)
        : 0,
    avgContentLength:
      withContent.length > 0 ? Math.round(totalLength / withContent.length) : 0,
  };
}

function getReviewsInYear(reviews: UserReviewedMovie[], year: number) {
  return reviews.filter(review => getReviewDate(review).getFullYear() === year);
}

export function buildYearSummary(reviews: UserReviewedMovie[]): YearSummary {
  const year = new Date().getFullYear();
  const current = getReviewsInYear(reviews, year);
  const previous = getReviewsInYear(reviews, year - 1);
  const avgRating =
    current.length > 0
      ? Math.round(
          (current.reduce(
            (sum, review) => sum + normalizeReviewRating(review.rating),
            0,
          ) /
            current.length) *
            10,
        ) / 10
      : 0;

  return {
    year,
    count: current.length,
    avgRating,
    previousYearCount: previous.length,
  };
}

export function getRaterInsight(avgRating: number, reviewCount: number): string {
  if (reviewCount === 0) {
    return i18n.t('statistics.insights.raterEmpty');
  }

  if (avgRating >= 4.2) {
    return i18n.t('statistics.insights.raterGenerous');
  }

  if (avgRating <= 2.8) {
    return i18n.t('statistics.insights.raterStrict');
  }

  return i18n.t('statistics.insights.raterBalanced');
}

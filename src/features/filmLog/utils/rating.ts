export const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export function getStarIconName(star: number, rating: number) {
  if (rating >= star) {
    return 'star';
  }
  if (rating >= star - 0.5) {
    return 'star-half-full';
  }
  return 'star-outline';
}

/** 1~5점. 일부 레거시 기록은 10~50(×10)으로 저장됨 */
export function normalizeReviewRating(rating: number) {
  if (!Number.isFinite(rating)) {
    return 0;
  }

  if (rating > 5) {
    return rating / 10;
  }

  return rating;
}

export function formatRating(rating: number) {
  const normalized = normalizeReviewRating(rating);
  const rounded = Math.round(normalized * 10) / 10;

  return Number.isInteger(rounded) ? `${rounded}.0` : String(rounded);
}

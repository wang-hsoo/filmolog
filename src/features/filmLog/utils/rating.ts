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

export function formatRating(rating: number) {
  return Number.isInteger(rating) ? `${rating}.0` : String(rating);
}

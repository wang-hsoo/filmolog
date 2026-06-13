const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p';

export type TmdbPosterSize = 'w92' | 'w154' | 'w342' | 'w500';

export function getTmdbPosterUrl(
  posterPath: string | null,
  size: TmdbPosterSize = 'w342',
): string | undefined {
  if (!posterPath) {
    return undefined;
  }

  return `${TMDB_POSTER_BASE}/${size}${posterPath}`;
}

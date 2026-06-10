const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export function getTmdbPosterUrl(posterPath: string | null): string | undefined {
  if (!posterPath) {
    return undefined;
  }

  return `${TMDB_POSTER_BASE}${posterPath}`;
}

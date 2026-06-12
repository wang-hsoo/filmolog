import { getSupabaseClient } from '../client';
import { refreshMovieStats } from '../explore/communityExplore';
import { upsertMovie, type UpsertMovieInput } from '../reviews/review';

export type WishlistMovieInput = UpsertMovieInput & {
  userId: string;
};

export async function isMovieInWishlist(
  userId: string,
  tmdbId: number,
): Promise<boolean> {
  const { data, error } = await getSupabaseClient()
    .from('wishlists')
    .select('tmdb_id')
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}

export async function addToWishlist({
  userId,
  tmdbId,
  title,
  posterPath,
  genreIds,
  releaseYear,
  originalTitle,
}: WishlistMovieInput) {
  await upsertMovie({
    tmdbId,
    title,
    posterPath,
    genreIds,
    releaseYear,
    originalTitle,
  });

  const { error } = await getSupabaseClient().from('wishlists').insert({
    user_id: userId,
    tmdb_id: tmdbId,
  });

  if (error) {
    if (error.code === '23505') {
      return;
    }
    throw error;
  }

  void refreshMovieStats().catch(() => undefined);
}

type WishlistMovieRow = {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
};

type WishlistWithMovieRow = {
  tmdb_id: number;
  added_at: string;
  movies: WishlistMovieRow | WishlistMovieRow[] | null;
};

export type UserWishlistMovie = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  addedAt: string;
};

function normalizeWishlistMovie(
  movies: WishlistWithMovieRow['movies'],
): WishlistMovieRow | null {
  if (!movies) {
    return null;
  }

  return Array.isArray(movies) ? (movies[0] ?? null) : movies;
}

export async function getUserWishlist(
  userId: string,
): Promise<UserWishlistMovie[]> {
  const { data, error } = await getSupabaseClient()
    .from('wishlists')
    .select('tmdb_id, added_at, movies(tmdb_id, title, poster_path)')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as WishlistWithMovieRow[]).flatMap(row => {
    const movie = normalizeWishlistMovie(row.movies);
    if (!movie) {
      return [];
    }

    return [
      {
        tmdbId: movie.tmdb_id,
        title: movie.title,
        posterPath: movie.poster_path,
        addedAt: row.added_at,
      },
    ];
  });
}

export async function removeFromWishlist(userId: string, tmdbId: number) {
  const { error } = await getSupabaseClient()
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId);

  if (error) {
    throw error;
  }

  void refreshMovieStats().catch(() => undefined);
}

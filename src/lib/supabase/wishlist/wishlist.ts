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

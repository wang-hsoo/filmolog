import { addCollectionMovie } from '../collection/collection';
import { getSupabaseClient } from '../client';

export type CreateReviewInput = {
  userId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  rating: number;
  content: string;
  watchedDate: string;
  collectionIds?: string[];
};

export async function upsertMovie(
  tmdbId: number,
  title: string,
  posterPath: string | null,
) {
  const { error } = await getSupabaseClient()
    .from('movies')
    .upsert(
      {
        tmdb_id: tmdbId,
        title,
        poster_path: posterPath,
      },
      { onConflict: 'tmdb_id' },
    );

  if (error) {
    throw error;
  }
}

async function addMovieToCollections(
  collectionIds: string[],
  tmdbId: number,
) {
  await Promise.all(
    collectionIds.map(async collectionId => {
      try {
        await addCollectionMovie(collectionId, tmdbId);
      } catch (error: unknown) {
        const code =
          error && typeof error === 'object' && 'code' in error
            ? String(error.code)
            : '';

        if (code !== '23505') {
          throw error;
        }
      }
    }),
  );
}

export async function createReview({
  userId,
  tmdbId,
  title,
  posterPath,
  rating,
  content,
  watchedDate,
  collectionIds = [],
}: CreateReviewInput) {
  await upsertMovie(tmdbId, title, posterPath);

  const { data, error } = await getSupabaseClient()
    .from('reviews')
    .insert({
      user_id: userId,
      tmdb_id: tmdbId,
      rating,
      content: content.trim(),
      watched_date: watchedDate,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (collectionIds.length > 0) {
    await addMovieToCollections(collectionIds, tmdbId);
  }

  return data;
}

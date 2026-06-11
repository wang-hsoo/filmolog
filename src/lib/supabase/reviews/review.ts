import { addCollectionMovie } from '../collection/collection';
import { getSupabaseClient } from '../client';
import type { UserReviewedMovie } from '../users/movie';

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

export type UpdateReviewInput = {
  reviewId: string;
  rating: number;
  content: string;
  watchedDate: string;
};

type ReviewWithMovieRow = {
  id: string;
  user_id: string;
  tmdb_id: number;
  rating: number;
  content: string | null;
  watched_date: string | null;
  created_at: string;
  movies:
    | {
        tmdb_id: number;
        title: string;
        poster_path: string | null;
      }
    | {
        tmdb_id: number;
        title: string;
        poster_path: string | null;
      }[]
    | null;
};

function normalizeReviewMovie(
  movies: ReviewWithMovieRow['movies'],
): { title: string; posterPath: string | null } | null {
  if (!movies) {
    return null;
  }

  const movie = Array.isArray(movies) ? (movies[0] ?? null) : movies;

  if (!movie) {
    return null;
  }

  return {
    title: movie.title,
    posterPath: movie.poster_path,
  };
}

function mapReviewRow(review: ReviewWithMovieRow): UserReviewedMovie {
  const movie = normalizeReviewMovie(review.movies);

  return {
    reviewId: review.id,
    tmdbId: review.tmdb_id,
    rating: review.rating,
    content: review.content,
    watchedDate: review.watched_date,
    createdAt: review.created_at,
    title: movie?.title ?? `영화 #${review.tmdb_id}`,
    posterPath: movie?.posterPath ?? null,
  };
}

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

export async function getReviewById(
  reviewId: string,
): Promise<UserReviewedMovie> {
  const { data, error } = await getSupabaseClient()
    .from('reviews')
    .select(
      `
      id,
      user_id,
      tmdb_id,
      rating,
      content,
      watched_date,
      created_at,
      movies (
        tmdb_id,
        title,
        poster_path
      )
    `,
    )
    .eq('id', reviewId)
    .single();

  if (error) {
    throw error;
  }

  return mapReviewRow(data as ReviewWithMovieRow);
}

export async function updateReview({
  reviewId,
  rating,
  content,
  watchedDate,
}: UpdateReviewInput) {
  const { data, error } = await getSupabaseClient()
    .from('reviews')
    .update({
      rating,
      content: content.trim(),
      watched_date: watchedDate,
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteReview(reviewId: string) {
  const { error } = await getSupabaseClient()
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    throw error;
  }
}

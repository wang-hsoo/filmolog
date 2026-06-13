import { addCollectionMovie } from '../collection/collection';
import { getSupabaseClient } from '../client';
import { i18n } from '../../../i18n';
import { refreshMovieStats } from '../explore/communityExplore';
import type { MoviePersonSnapshot } from '../../tmdb/creditsSnapshot';
import type { UserReviewedMovie } from '../users/movie';

export type UpsertMovieInput = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  genreIds?: number[];
  directors?: MoviePersonSnapshot[];
  topCast?: MoviePersonSnapshot[];
  releaseYear?: number | null;
  originalTitle?: string | null;
};

export type CreateReviewInput = {
  userId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  genreIds?: number[];
  directors?: MoviePersonSnapshot[];
  topCast?: MoviePersonSnapshot[];
  releaseYear?: number | null;
  originalTitle?: string | null;
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
        genre_ids: number[] | null;
        release_year: number | null;
        directors: MoviePersonSnapshot[] | null;
        top_cast: MoviePersonSnapshot[] | null;
      }
    | {
        tmdb_id: number;
        title: string;
        poster_path: string | null;
        genre_ids: number[] | null;
        release_year: number | null;
        directors: MoviePersonSnapshot[] | null;
        top_cast: MoviePersonSnapshot[] | null;
      }[]
    | null;
};

function normalizeReviewMovie(
  movies: ReviewWithMovieRow['movies'],
): {
  title: string;
  posterPath: string | null;
  genreIds: number[];
  releaseYear: number | null;
  directors: MoviePersonSnapshot[];
  topCast: MoviePersonSnapshot[];
} | null {
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
    genreIds: movie.genre_ids ?? [],
    releaseYear: movie.release_year ?? null,
    directors: movie.directors ?? [],
    topCast: movie.top_cast ?? [],
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
    title: movie?.title ?? i18n.t('common.movieMeta.fallbackMovieTitle', { id: review.tmdb_id }),
    posterPath: movie?.posterPath ?? null,
    genreIds: movie?.genreIds ?? [],
    releaseYear: movie?.releaseYear ?? null,
    directors: movie?.directors ?? [],
    topCast: movie?.topCast ?? [],
  };
}

export async function upsertMovie({
  tmdbId,
  title,
  posterPath,
  genreIds,
  directors,
  topCast,
  releaseYear,
  originalTitle,
}: UpsertMovieInput) {
  const row: Record<string, unknown> = {
    tmdb_id: tmdbId,
    title,
    poster_path: posterPath,
  };

  if (genreIds && genreIds.length > 0) {
    row.genre_ids = genreIds;
  }

  if (directors && directors.length > 0) {
    row.directors = directors;
  }

  if (topCast && topCast.length > 0) {
    row.top_cast = topCast;
  }

  if (releaseYear != null) {
    row.release_year = releaseYear;
  }

  if (originalTitle) {
    row.original_title = originalTitle;
  }

  const { error } = await getSupabaseClient()
    .from('movies')
    .upsert(row, { onConflict: 'tmdb_id' });

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
  genreIds,
  directors,
  topCast,
  releaseYear,
  originalTitle,
  rating,
  content,
  watchedDate,
  collectionIds = [],
}: CreateReviewInput) {
  await upsertMovie({
    tmdbId,
    title,
    posterPath,
    genreIds,
    directors,
    topCast,
    releaseYear,
    originalTitle,
  });

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

  void refreshMovieStats().catch(() => undefined);

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
        poster_path,
        genre_ids,
        release_year,
        directors,
        top_cast
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

import { getSupabaseClient } from '../client';

type MovieRow = {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
};

type ReviewWithMovieRow = {
  id: string;
  user_id: string;
  tmdb_id: number;
  rating: number;
  content: string | null;
  watched_date: string | null;
  created_at: string;
  movies: MovieRow | MovieRow[] | null;
};

export type UserReviewedMovie = {
  reviewId: string;
  tmdbId: number;
  rating: number;
  content: string | null;
  watchedDate: string | null;
  createdAt: string;
  title: string;
  posterPath: string | null;
};

function normalizeMovie(
  movies: ReviewWithMovieRow['movies'],
): MovieRow | null {
  if (!movies) {
    return null;
  }

  return Array.isArray(movies) ? (movies[0] ?? null) : movies;
}

export async function getUserReviewedMovies(
  userId: string,
): Promise<UserReviewedMovie[]> {
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReviewWithMovieRow[]).map(review => {
    const movie = normalizeMovie(review.movies);

    return {
      reviewId: review.id,
      tmdbId: review.tmdb_id,
      rating: review.rating,
      content: review.content,
      watchedDate: review.watched_date,
      createdAt: review.created_at,
      title: movie?.title ?? `영화 #${review.tmdb_id}`,
      posterPath: movie?.poster_path ?? null,
    };
  });
}

/** @deprecated getUserReviewedMovies 사용 */
export const getUserMovies = getUserReviewedMovies;

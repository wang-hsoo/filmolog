import { getSupabaseClient } from '../client';

import type {
  Collection,
  CollectionDetail,
  CollectionListItem,
  CollectionMovieItem,
} from './types';

type CollectionMovieRow = {
  tmdb_id: number;
  created_at?: string;
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

type CollectionMovieStatsRow = {
  collection_id: string;
  created_at?: string;
  movies: { title: string } | { title: string }[] | null;
};

type CollectionMovieInfo = {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
};

function normalizeCollectionMovie(
  movies: CollectionMovieRow['movies'],
): CollectionMovieInfo | null {
  if (!movies) {
    return null;
  }

  return Array.isArray(movies) ? (movies[0] ?? null) : movies;
}

function normalizeMovieTitle(
  movies: CollectionMovieStatsRow['movies'],
): string | null {
  if (!movies) {
    return null;
  }

  const movie = Array.isArray(movies) ? (movies[0] ?? null) : movies;
  return movie?.title ?? null;
}

async function getCollectionMovieStats(collectionIds: string[]) {
  const stats = new Map<
    string,
    { movieCount: number; latestMovieTitle: string | null }
  >();

  if (collectionIds.length === 0) {
    return stats;
  }

  const supabase = getSupabaseClient();
  const selectWithCreatedAt = `
    collection_id,
    created_at,
    movies (
      title
    )
  `;
  const selectBasic = `
    collection_id,
    movies (
      title
    )
  `;

  const { data, error } = await supabase
    .from('collection_movies')
    .select(selectWithCreatedAt)
    .in('collection_id', collectionIds)
    .order('created_at', { ascending: false });

  let rows: CollectionMovieStatsRow[] = [];

  if (!error) {
    rows = (data ?? []) as CollectionMovieStatsRow[];
  } else {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('collection_movies')
      .select(selectBasic)
      .in('collection_id', collectionIds);

    if (fallbackError) {
      throw fallbackError;
    }

    rows = ((fallbackData ?? []) as CollectionMovieStatsRow[]).slice().reverse();
  }

  for (const row of rows) {
    const current = stats.get(row.collection_id) ?? {
      movieCount: 0,
      latestMovieTitle: null,
    };

    current.movieCount += 1;

    if (!current.latestMovieTitle) {
      current.latestMovieTitle = normalizeMovieTitle(row.movies);
    }

    stats.set(row.collection_id, { ...current });
  }

  return stats;
}

export async function createCollection(
  userId: string,
  name: string,
  description: string,
  theme_id: string,
) {
  const { data, error } = await getSupabaseClient()
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description,
      theme_id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function addCollectionMovie(
  collectionId: string,
  tmdbId: number,
) {
  const { data, error } = await getSupabaseClient()
    .from('collection_movies')
    .insert({
      collection_id: collectionId,
      tmdb_id: tmdbId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeCollectionMovie(
  collectionId: string,
  tmdbId: number,
) {
  const { error } = await getSupabaseClient()
    .from('collection_movies')
    .delete()
    .eq('collection_id', collectionId)
    .eq('tmdb_id', tmdbId);

  if (error) {
    throw error;
  }
}

export async function deleteCollection(collectionId: string) {
  const supabase = getSupabaseClient();

  const { error: moviesError } = await supabase
    .from('collection_movies')
    .delete()
    .eq('collection_id', collectionId);

  if (moviesError) {
    throw moviesError;
  }

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  if (error) {
    throw error;
  }
}

export async function getCollections(userId: string): Promise<Collection[]> {
  const { data, error } = await getSupabaseClient()
    .from('collections')
    .select('id, user_id, name, description, theme_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Collection[];
}

export async function getCollectionListItems(
  userId: string,
): Promise<CollectionListItem[]> {
  const collections = await getCollections(userId);
  const stats = await getCollectionMovieStats(
    collections.map(collection => collection.id),
  );

  return collections.map(collection => {
    const collectionStats = stats.get(collection.id);

    return {
      ...collection,
      movieCount: collectionStats?.movieCount ?? 0,
      latestMovieTitle: collectionStats?.latestMovieTitle ?? null,
    };
  });
}

async function fetchCollectionMovies(collectionId: string) {
  const supabase = getSupabaseClient();
  const selectWithCreatedAt = `
    tmdb_id,
    created_at,
    movies (
      tmdb_id,
      title,
      poster_path
    )
  `;
  const selectBasic = `
    tmdb_id,
    movies (
      tmdb_id,
      title,
      poster_path
    )
  `;

  const { data, error } = await supabase
    .from('collection_movies')
    .select(selectWithCreatedAt)
    .eq('collection_id', collectionId);

  if (!error) {
    return (data ?? []) as CollectionMovieRow[];
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('collection_movies')
    .select(selectBasic)
    .eq('collection_id', collectionId);

  if (fallbackError) {
    throw fallbackError;
  }

  return (fallbackData ?? []) as CollectionMovieRow[];
}

export async function getCollectionDetail(
  collectionId: string,
): Promise<CollectionDetail> {
  const supabase = getSupabaseClient();

  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('id, user_id, name, description, theme_id, created_at')
    .eq('id', collectionId)
    .single();

  if (collectionError) {
    throw collectionError;
  }

  const rows = await fetchCollectionMovies(collectionId);
  const tmdbIds = rows.map(row => row.tmdb_id);
  const reviewMap = new Map<
    number,
    {
      reviewId: string;
      rating: number;
      watchedDate: string | null;
      createdAt: string;
    }
  >();

  if (tmdbIds.length > 0) {
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, tmdb_id, rating, watched_date, created_at')
      .eq('user_id', collection.user_id)
      .in('tmdb_id', tmdbIds);

    if (reviewsError) {
      throw reviewsError;
    }

    for (const review of reviews ?? []) {
      reviewMap.set(review.tmdb_id, {
        reviewId: review.id,
        rating: review.rating,
        watchedDate: review.watched_date,
        createdAt: review.created_at,
      });
    }
  }

  const movies: CollectionMovieItem[] = rows
    .map(row => {
      const movie = normalizeCollectionMovie(row.movies);
      const review = reviewMap.get(row.tmdb_id);
      const addedAt =
        row.created_at ??
        review?.createdAt ??
        review?.watchedDate ??
        '';

      return {
        tmdbId: row.tmdb_id,
        reviewId: review?.reviewId ?? null,
        title: movie?.title ?? `영화 #${row.tmdb_id}`,
        posterPath: movie?.poster_path ?? null,
        rating: review?.rating ?? null,
        watchedDate: review?.watchedDate ?? null,
        addedAt,
      };
    })
    .sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );

  return {
    ...(collection as Collection),
    movies,
  };
}

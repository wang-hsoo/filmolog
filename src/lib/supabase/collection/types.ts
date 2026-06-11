export type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  theme_id: string;
  created_at: string;
};

export type CollectionListItem = Collection & {
  movieCount: number;
  latestMovieTitle: string | null;
};

export type CollectionMovieItem = {
  tmdbId: number;
  reviewId: string | null;
  title: string;
  posterPath: string | null;
  rating: number | null;
  watchedDate: string | null;
  addedAt: string;
};

export type CollectionDetail = Collection & {
  movies: CollectionMovieItem[];
};

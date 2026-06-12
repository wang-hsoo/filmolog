export type CommunityMovieRow = {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  avg_rating: number;
  review_count: number;
  collection_count?: number;
  wishlist_count?: number;
};

export type OnboardingStackParamList = {
  Nickname: undefined;
  Genre: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  App: undefined;
  Collection: undefined;
  CollectionList: undefined;
  CollectionDetail: { collectionId: string };
  CollectionAddMovies: { collectionId: string };
  FilmLog: { tmdbId?: number } | undefined;
  FilmLogComplete: {
    reviewId: string;
    title: string;
    posterPath: string | null;
    rating: number;
    reviewNumber: number;
  };
  ReviewDetail: { reviewId: string };
  ReviewLogList: undefined;
  MovieDetail: { tmdbId: number };
  Settings: undefined;
  ProfileEdit: undefined;
  GenreEdit: undefined;
  WishlistList: undefined;
  BadgeList: undefined;
};

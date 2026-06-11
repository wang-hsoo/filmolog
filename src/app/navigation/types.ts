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
  FilmLog: undefined;
};

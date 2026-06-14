export { getSupabaseClient, restoreSupabaseSession } from './client';
export {
  getCurrentSession,
  getCurrentUser,
  getCurrentUserWithProfile,
  getUserProfile,
  useAuth,
  signOutFromApp,
  bindSupabaseAuthAppState,
} from './auth';
export {
  fetchUserProfile,
  getGoogleIdFromAuthUser,
  isOnboardingComplete,
  ProfileProvider,
  useProfile,
  useProfileContext,
  type UserProfile,
  getUserStats,
  useGetUserStats,
  getUserFavoriteGenres,
  useGetUserFavoriteGenres,
  useGetUserReviewedMovies,
  DeleteAccountError,
  deleteUserAccount,
} from './users';

export {
  useCreateCollection,
  useAddCollectionMovie,
  useGetCollections,
  type CreateCollectionParams,
  type Collection,
} from './collection';
export {
  communityExploreKeys,
  useCommunityMostCollected,
  useCommunityMostReviewed,
  useCommunityTopRatedByGenres,
  useCommunityTopRatedForMe,
  useTopRatedFromStats,
  type CommunityMovieRow,
} from './explore';
export {
  getMovieCommunityStats,
  useGetMovieCommunityStats,
  type MovieCommunityStats,
} from './movies';
export {
  useIsInWishlist,
  useToggleWishlist,
  useGetUserWishlist,
  wishlistKeys,
} from './wishlist';
export { badgeKeys, useGetUserBadges } from './badges';
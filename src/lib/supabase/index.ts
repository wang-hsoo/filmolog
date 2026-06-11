export { getSupabaseClient, restoreSupabaseSession } from './client';
export {
  getCurrentSession,
  getCurrentUser,
  getCurrentUserWithProfile,
  getUserProfile,
  useAuth,
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
} from './users';

export {
  useCreateCollection,
  useAddCollectionMovie,
  useGetCollections,
  type CreateCollectionParams,
  type Collection,
} from './collection';
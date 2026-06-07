export {
  getCurrentSession,
  getCurrentUser,
  getCurrentUserWithProfile,
  getUserProfile,
} from './auth';
export { getSupabaseClient, restoreSupabaseSession } from './client';
export {
  fetchUserProfile,
  getGoogleIdFromAuthUser,
  isOnboardingComplete,
  type UserProfile,
} from './profile';
export { useAuth } from './useAuth';
export { useProfile } from './useProfile';
export { ProfileProvider, useProfileContext } from './ProfileProvider';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchUserProfile,
  isOnboardingComplete,
  type UserProfile,
} from './profile';

type ProfileState = {
  profile: UserProfile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  refetch: () => Promise<void>;
};

export function useProfile(userId: string | undefined): ProfileState {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));

  const refetch = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const nextProfile = await fetchUserProfile(userId);
      setProfile(nextProfile);
    } catch (error) {
      console.error('[useProfile] fetch failed', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    profile,
    isLoading,
    isOnboardingComplete: isOnboardingComplete(profile),
    refetch,
  };
}

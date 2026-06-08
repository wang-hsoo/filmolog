import { createContext, useContext, type ReactNode } from 'react';

import type { UserProfile } from './profile';
import { useProfile } from './useProfile';

type ProfileContextValue = {
  profile: UserProfile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  refetch: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

type ProfileProviderProps = {
  userId: string;
  children: ReactNode;
};

export function ProfileProvider({ userId, children }: ProfileProviderProps) {
  const value = useProfile(userId);

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfileContext(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within ProfileProvider');
  }
  return context;
}

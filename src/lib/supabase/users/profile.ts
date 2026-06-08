import type { User } from '@supabase/supabase-js';

import { getSupabaseClient } from '../client';

export type UserProfile = {
  id: string;
  google_id: string | null;
  nickname: string | null;
  preferred_genres: number[] | null;
  created_at: string | null;
};

export function getGoogleIdFromAuthUser(user: User): string | null {
  const googleIdentity = user.identities?.find(
    identity => identity.provider === 'google',
  );

  return (
    googleIdentity?.id ??
    (typeof user.user_metadata?.sub === 'string'
      ? user.user_metadata.sub
      : null)
  );
}

export function isOnboardingComplete(profile: UserProfile | null): boolean {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.nickname?.trim() &&
      profile.preferred_genres &&
      profile.preferred_genres.length > 0,
  );
}

export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('id, google_id, nickname, preferred_genres, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as UserProfile | null;
}

import { signOutGoogleSession } from '../../google/googleAuth';

import { getSupabaseClient } from '../client';

export async function signOutFromApp() {
  await signOutGoogleSession();

  const { error } = await getSupabaseClient().auth.signOut();

  if (error) {
    throw error;
  }
}

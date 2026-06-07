import { useCallback, useEffect, useState } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { env } from '../../../config/env';
import { getSupabaseClient } from '../../../lib/supabase/client';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: env.googleClientId,
      offlineAccess: true,
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const googleResponse = await GoogleSignin.signIn();
      if (!isSuccessResponse(googleResponse)) {
        return;
      }

      const idToken = googleResponse.data.idToken;
      if (!idToken) {
        throw new Error('Google idToken이 없습니다.');
      }

      const { error } = await getSupabaseClient().auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }
      console.error('[useLogin]', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return { loginWithGoogle, isLoading };
}

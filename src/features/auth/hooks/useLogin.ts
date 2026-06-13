import { useCallback, useEffect, useState } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {
  configureGoogleSignIn,
  prepareGoogleAccountPicker,
} from '../../../lib/google/googleAuth';
import { getSupabaseClient } from '../../../lib/supabase';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import { i18n } from '../../../i18n';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await prepareGoogleAccountPicker();

      const googleResponse = await GoogleSignin.signIn();
      if (!isSuccessResponse(googleResponse)) {
        return;
      }

      const idToken = googleResponse.data.idToken;
      if (!idToken) {
        throw new Error(i18n.t('errors.auth.googleIdTokenMissing'));
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

      if (
        isErrorWithCode(error) &&
        (error.code === '10' ||
          String(error.message ?? '').includes('DEVELOPER_ERROR'))
      ) {
        console.error('[useLogin]', error);
        archiveAlert(
          i18n.t('errors.auth.googleConfig.title'),
          i18n.t('errors.auth.googleConfig.message'),
        );
        return;
      }

      console.error('[useLogin]', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return { loginWithGoogle, isLoading };
}

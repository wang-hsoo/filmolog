import { useCallback, useState } from 'react';

import { i18n } from '../../../i18n';
import {
  getGoogleIdFromAuthUser,
  getSupabaseClient,
  useAuth,
  useProfileContext,
} from '../../../lib/supabase';

type UseOnboardingOptions = {
  onNicknameSaved?: () => void;
};

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const { onNicknameSaved } = options;
  const { user } = useAuth();
  const { refetch } = useProfileContext();
  const [isSaving, setIsSaving] = useState(false);

  const saveNickname = useCallback(
    async (nickname: string) => {
      if (!user) {
        throw new Error(i18n.t('auth.onboarding.loginRequired'));
      }

      setIsSaving(true);
      try {
        const { error } = await getSupabaseClient()
          .from('users')
          .upsert(
            {
              id: user.id,
              google_id: getGoogleIdFromAuthUser(user),
              nickname: nickname.trim(),
            },
            { onConflict: 'id' },
          );

        if (error) {
          throw error;
        }

        await refetch();
        onNicknameSaved?.();
      } catch (error) {
        console.error('[useOnboarding] saveNickname failed', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [onNicknameSaved, refetch, user],
  );

  const completeOnboarding = useCallback(
    async (preferredGenres: number[]) => {
      if (!user) {
        throw new Error(i18n.t('auth.onboarding.loginRequired'));
      }

      if (preferredGenres.length === 0) {
        throw new Error(i18n.t('auth.genre.selectAtLeastOne'));
      }

      setIsSaving(true);
      try {
        const { error } = await getSupabaseClient()
          .from('users')
          .update({
            preferred_genres: preferredGenres,
          })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        await refetch();
      } catch (error) {
        console.error('[useOnboarding] completeOnboarding failed', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [refetch, user],
  );

  return {
    isSaving,
    saveNickname,
    completeOnboarding,
  };
}

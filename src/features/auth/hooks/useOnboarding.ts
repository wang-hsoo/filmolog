import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { getSupabaseClient } from '../../../lib/supabase/client';
import { getGoogleIdFromAuthUser } from '../../../lib/supabase/profile';
import { useProfileContext } from '../../../lib/supabase/ProfileProvider';
import { useAuth } from '../../../lib/supabase/useAuth';

type OnboardingStackParamList = {
  Nickname: undefined;
  Genre: undefined;
};

export function useOnboarding() {
  const navigation =
    useNavigation<StackNavigationProp<OnboardingStackParamList>>();
  const { user } = useAuth();
  const { refetch } = useProfileContext();
  const [isSaving, setIsSaving] = useState(false);

  const saveNickname = useCallback(
    async (nickname: string) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.');
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
        navigation.navigate('Genre');
      } catch (error) {
        console.error('[useOnboarding] saveNickname failed', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [navigation, refetch, user],
  );

  const completeOnboarding = useCallback(
    async (preferredGenres: number[]) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      if (preferredGenres.length === 0) {
        throw new Error('선호 장르를 하나 이상 선택하세요.');
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

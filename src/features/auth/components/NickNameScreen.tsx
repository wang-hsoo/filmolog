import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useOnboarding } from '../hooks/useOnboarding';
import { useAuth, useProfileContext } from '../../../lib/supabase';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import { AppScreen, theme } from '../../../theme';
import { AnimatedEnter } from './AnimatedEnter';

type NickNameScreenProps = {
  onNicknameSaved?: () => void;
};

function NickNameScreen({ onNicknameSaved }: NickNameScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const { saveNickname, isSaving } = useOnboarding({ onNicknameSaved });
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (profile?.nickname) {
      setNickname(profile.nickname);
    }
  }, [profile?.nickname]);

  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || isSaving) {
      return;
    }

    try {
      await saveNickname(trimmed);
    } catch {
      archiveAlert(
        t('errors.saveFailed.generic'),
        t('errors.saveFailed.nickname'),
      );
    }
  };

  const displayName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : null;

  return (
    <AppScreen
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      <Container>
        {displayName ? (
          <AnimatedEnter delay={80}>
            <Greeting>{t('auth.nickname.greeting', { name: displayName })}</Greeting>
          </AnimatedEnter>
        ) : null}

        <AnimatedEnter delay={displayName ? 180 : 80}>
          <Title>{t('auth.nickname.title')}</Title>
        </AnimatedEnter>

        <AnimatedEnter delay={displayName ? 280 : 180}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.nickname.placeholder')}
            placeholderTextColor={theme.colors.defaultText}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            maxLength={20}
          />
        </AnimatedEnter>

        <AnimatedEnter delay={displayName ? 380 : 280}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!nickname.trim() || isSaving) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!nickname.trim() || isSaving}>
            <Text style={styles.submitText}>
              {isSaving ? t('common.actions.saving') : t('common.actions.next')}
            </Text>
          </TouchableOpacity>
        </AnimatedEnter>
      </Container>
    </AppScreen>
  );
}

export default NickNameScreen;

const Container = styled.View`
  flex: 1;
  padding: 20px;
  gap: 16px;
  justify-content: flex-start;
`;

const Greeting = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.whiteText};
  opacity: 0.8;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.whiteText};
  margin-bottom: 4px;
`;

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.buttonColor,
    color: theme.colors.defaultText,
    fontSize: 16,
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.whiteText,
  },
});

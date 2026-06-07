import { useEffect, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { AnimatedEnter } from './AnimatedEnter';
import { useOnboarding } from '../hooks/useOnboarding';
import { useProfileContext } from '../../../lib/supabase/ProfileProvider';
import { useAuth } from '../../../lib/supabase/useAuth';
import { AppScreen, theme } from '../../../theme';

function NickNameScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const { saveNickname, isSaving } = useOnboarding();
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
      Alert.alert('저장 실패', '닉네임 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const displayName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : null;

  return (
    <AppScreen
      style={{
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right,
      }}>
      <Container>
        {displayName ? (
          <AnimatedEnter delay={80}>
            <Greeting>{displayName}님, 환영해요.</Greeting>
          </AnimatedEnter>
        ) : null}

        <AnimatedEnter delay={displayName ? 180 : 80}>
          <Title>닉네임을 설정해주세요.</Title>
        </AnimatedEnter>

        <AnimatedEnter delay={displayName ? 280 : 180}>
          <Input
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor={theme.colors.defaultText}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            maxLength={20}
          />
        </AnimatedEnter>

        <AnimatedEnter delay={displayName ? 380 : 280} style={styles.buttonWrap}>
          <SubmitButton
            onPress={handleSubmit}
            disabled={!nickname.trim() || isSaving}>
            <SubmitText>{isSaving ? '저장 중...' : '다음'}</SubmitText>
          </SubmitButton>
        </AnimatedEnter>
      </Container>
    </AppScreen>
  );
}

export default NickNameScreen;

const styles = {
  buttonWrap: {
    marginTop: 8,
  },
} as const;

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

const Input = styled(TextInput)`
  height: 48px;
  border-radius: 12px;
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.buttonColor};
  color: ${({ theme }) => theme.colors.defaultText};
  font-size: 16px;
`;

const SubmitButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  height: 52px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const SubmitText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.whiteText};
`;

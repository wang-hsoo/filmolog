import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useProfileContext } from '../../../lib/supabase';
import { AppScreen, theme } from '../../../theme';
import { AnimatedEnter } from './AnimatedEnter';
import { useOnboarding } from '../hooks/useOnboarding';
import { useGetGenres } from '../../../lib/tmdb';

const MAX_GENRE_SELECTION = 3;

function GenreScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfileContext();
  const { data, isLoading, isError } = useGetGenres();
  const { completeOnboarding, isSaving } = useOnboarding();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (profile?.preferred_genres?.length) {
      setSelectedIds(profile.preferred_genres);
    }
  }, [profile?.preferred_genres]);

  const toggleGenre = (genreId: number) => {
    setSelectedIds(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      }
      if (prev.length >= MAX_GENRE_SELECTION) {
        return prev;
      }
      return [...prev, genreId];
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0 || isSaving) {
      return;
    }

    try {
      await completeOnboarding(selectedIds);
    } catch {
      Alert.alert(
        '저장 실패',
        '선호 장르 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  };

  const nickname = profile?.nickname?.trim();

  return (
    <AppScreen
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      <Container>
        {nickname ? (
          <AnimatedEnter delay={80}>
            <Greeting>{nickname}님, 거의 다 왔어요.</Greeting>
          </AnimatedEnter>
        ) : null}

        <AnimatedEnter delay={nickname ? 180 : 80}>
          <Title>선호 장르를 선택해주세요.</Title>
          <Subtitle>최대 {MAX_GENRE_SELECTION}개까지 선택할 수 있어요.</Subtitle>
        </AnimatedEnter>

        <AnimatedEnter delay={nickname ? 280 : 180} style={styles.genreWrap}>
          {isLoading ? (
            <LoaderWrap>
              <ActivityIndicator color={theme.colors.primary} size="large" />
            </LoaderWrap>
          ) : isError ? (
            <ErrorText>장르 목록을 불러오지 못했습니다.</ErrorText>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.genreScroll}>
              <GenreGrid>
                {(data?.genres ?? []).map(genre => {
                  const isSelected = selectedIds.includes(genre.id);
                  return (
                    <GenreChip
                      key={genre.id}
                      $selected={isSelected}
                      onPress={() => toggleGenre(genre.id)}>
                      <GenreChipText $selected={isSelected}>
                        {genre.name}
                      </GenreChipText>
                    </GenreChip>
                  );
                })}
              </GenreGrid>
            </ScrollView>
          )}
        </AnimatedEnter>

        <AnimatedEnter delay={nickname ? 380 : 280} style={styles.buttonWrap}>
          <SubmitButton
            onPress={handleSubmit}
            disabled={selectedIds.length === 0 || isSaving || isLoading}
            $disabled={selectedIds.length === 0 || isSaving || isLoading}>
            <SubmitText>
              {isSaving
                ? '저장 중...'
                : `시작하기${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`}
            </SubmitText>
          </SubmitButton>
        </AnimatedEnter>
      </Container>
    </AppScreen>
  );
}

export default GenreScreen;

const styles = {
  genreWrap: {
    flex: 1,
    minHeight: 200,
  },
  genreScroll: {
    paddingBottom: 8,
  },
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

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.whiteText};
  opacity: 0.6;
`;

const LoaderWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 160px;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.whiteText};
  opacity: 0.7;
  text-align: center;
  padding: 24px 0;
`;

const GenreGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

const GenreChip = styled.TouchableOpacity<{ $selected: boolean }>`
  padding: 10px 16px;
  border-radius: 999px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.buttonColor};
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : 'rgba(255, 255, 255, 0.12)'};
`;

const GenreChipText = styled.Text<{ $selected: boolean }>`
  font-size: 14px;
  font-weight: ${({ $selected }) => ($selected ? '600' : '500')};
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.whiteText : theme.colors.defaultText};
`;

const SubmitButton = styled.TouchableOpacity<{ $disabled?: boolean }>`
  height: 52px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

const SubmitText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.whiteText};
`;

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import { ArchiveSectionHeader, Header } from '../../../components';
import { useProfileContext } from '../../../lib/supabase';
import { useGetGenres } from '../../../lib/tmdb';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import { AppScreen, theme } from '../../../theme';
import { useOnboarding } from '../../auth/hooks/useOnboarding';

const MAX_GENRE_SELECTION = 3;

function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { profile } = useProfileContext();
  const { data, isLoading, isError } = useGetGenres();
  const { saveNickname, completeOnboarding, isSaving } = useOnboarding();

  const [nickname, setNickname] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (profile?.nickname) {
      setNickname(profile.nickname);
    }
  }, [profile?.nickname]);

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

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || selectedIds.length === 0 || isSaving) {
      return;
    }

    try {
      if (trimmed !== profile?.nickname?.trim()) {
        await saveNickname(trimmed);
      }

      const currentGenres = profile?.preferred_genres ?? [];
      const genresChanged =
        selectedIds.length !== currentGenres.length ||
        selectedIds.some(id => !currentGenres.includes(id));

      if (genresChanged) {
        await completeOnboarding(selectedIds);
      }

      navigation.goBack();
    } catch {
      archiveAlert(
        '저장 실패',
        '프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  };

  const canSave =
    nickname.trim().length > 0 && selectedIds.length > 0 && !isSaving;

  return (
    <AppScreen
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}>
      <Header navigation={navigation} subtitle="PROFILE EDIT" hideRight />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <ArchiveSectionHeader
            overline="PROFILE"
            title="프로필 수정"
            subtitle="닉네임과 선호 장르를 변경할 수 있어요."
          />

          <FieldBlock>
            <FieldLabel>닉네임</FieldLabel>
            <NicknameInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임"
              placeholderTextColor={theme.colors.primaryMuted}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </FieldBlock>

          <FieldBlock>
            <FieldLabel>선호 장르 (최대 {MAX_GENRE_SELECTION}개)</FieldLabel>
            {isLoading ? (
              <LoaderWrap>
                <ActivityIndicator color={theme.colors.primary} size="large" />
              </LoaderWrap>
            ) : isError ? (
              <ErrorText>장르 목록을 불러오지 못했습니다.</ErrorText>
            ) : (
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
            )}
          </FieldBlock>

          <SaveButton
            onPress={handleSave}
            disabled={!canSave}
            $disabled={!canSave}
            accessibilityRole="button">
            <SaveText>{isSaving ? '저장 중...' : '저장하기'}</SaveText>
          </SaveButton>
        </Content>
      </ScrollView>
    </AppScreen>
  );
}

export default ProfileEditScreen;

const H_PAD = 20;

const Content = styled.View`
  padding: 8px ${H_PAD}px 32px;
  gap: 20px;
`;

const FieldBlock = styled.View`
  gap: 10px;
`;

const FieldLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const NicknameInput = styled(TextInput)`
  height: 48px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const LoaderWrap = styled.View`
  align-items: center;
  justify-content: center;
  min-height: 120px;
`;

const ErrorText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.dashboardText};
  text-align: center;
  padding: 24px 0;
`;

const GenreGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

const GenreChip = styled.Pressable<{ $selected: boolean }>`
  padding: 10px 16px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.surface : theme.colors.dashboardBackground};
`;

const GenreChipText = styled.Text<{ $selected: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 14px;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.goldBright : theme.colors.dashboardText};
`;

const SaveButton = styled.Pressable<{ $disabled?: boolean }>`
  margin-top: 8px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

const SaveText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.whiteText};
`;

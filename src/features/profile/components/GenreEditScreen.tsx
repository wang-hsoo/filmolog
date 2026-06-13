import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
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

function GenreEditScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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

  const handleSave = async () => {
    if (selectedIds.length === 0 || isSaving) {
      return;
    }

    const currentGenres = profile?.preferred_genres ?? [];
    const genresChanged =
      selectedIds.length !== currentGenres.length ||
      selectedIds.some(id => !currentGenres.includes(id));

    if (!genresChanged) {
      navigation.goBack();
      return;
    }

    try {
      await completeOnboarding(selectedIds);
      navigation.goBack();
    } catch {
      archiveAlert(
        t('errors.saveFailed.generic'),
        t('errors.saveFailed.genres'),
      );
    }
  };

  const canSave = selectedIds.length > 0 && !isSaving;

  return (
    <AppScreen
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}>
      <Header navigation={navigation} subtitle="GENRE" hideRight />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <ArchiveSectionHeader
            overline="TASTE"
            title={t('profile.genreEdit.title')}
            subtitle={t('profile.genreEdit.subtitle', {
              count: MAX_GENRE_SELECTION,
            })}
          />

          {isLoading ? (
            <LoaderWrap>
              <ActivityIndicator color={theme.colors.primary} size="large" />
            </LoaderWrap>
          ) : isError ? (
            <ErrorText>{t('auth.genre.loadFailed')}</ErrorText>
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

          <SaveButton
            onPress={handleSave}
            disabled={!canSave}
            $disabled={!canSave}
            accessibilityRole="button">
            <SaveText>
              {isSaving
                ? t('common.actions.saving')
                : selectedIds.length > 0
                  ? t('common.actions.saveWithCount', {
                      count: selectedIds.length,
                    })
                  : t('common.actions.saveAction')}
            </SaveText>
          </SaveButton>
        </Content>
      </ScrollView>
    </AppScreen>
  );
}

export default GenreEditScreen;

const H_PAD = 20;

const Content = styled.View`
  padding: 8px ${H_PAD}px 32px;
  gap: 20px;
`;

const LoaderWrap = styled.View`
  align-items: center;
  justify-content: center;
  min-height: 160px;
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

import { LegendList } from '@legendapp/list/react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSectionHeader,
  COLLECTION_THEMES,
  Header,
  MovieRowItem,
  MOVIE_ROW_ITEM_HEIGHT,
  POSTER_HEIGHT,
  POSTER_WIDTH,
} from '../../../components';
import { useAuth } from '../../../lib/supabase/auth';
import {
  useAddCollectionMovie,
  useCreateCollection,
} from '../../../lib/supabase/collection';
import {
  useGetUserReviewedMovies,
  type UserReviewedMovie,
} from '../../../lib/supabase/users';
import type { TmdbMovie } from '../../../lib/tmdb/types';
import { AppScreen, theme } from '../../../theme';

function toDisplayMovie(item: UserReviewedMovie): TmdbMovie {
  return {
    id: item.tmdbId,
    title: item.title,
    original_title: item.title,
    overview: item.content ?? '',
    poster_path: item.posterPath,
    backdrop_path: null,
    release_date: '',
    vote_average: item.rating,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
    original_language: 'ko',
  };
}

function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    COLLECTION_THEMES[0].themeId,
  );
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);

  const { data: userMovies = [], isLoading: isMoviesLoading } =
    useGetUserReviewedMovies(user?.id ?? '');
  const { mutateAsync: createCollection, isPending: isCreating } =
    useCreateCollection();
  const { mutateAsync: addCollectionMovie } = useAddCollectionMovie();

  const selectedTheme = useMemo(
    () =>
      COLLECTION_THEMES.find(themeItem => themeItem.themeId === selectedThemeId) ??
      COLLECTION_THEMES[0],
    [selectedThemeId],
  );

  const toggleMovie = useCallback((movieId: string) => {
    setSelectedMovieIds(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    if (!user?.id) {
      return;
    }
    if (!trimmedName) {
      Alert.alert('입력 확인', '컬렉션 이름을 입력해주세요.');
      return;
    }

    try {
      const collection = await createCollection({
        userId: user.id,
        name: trimmedName,
        description: description.trim(),
        theme_id: selectedThemeId,
      });

      if (collection?.id && selectedMovieIds.length > 0) {
        await Promise.all(
          selectedMovieIds.map(id =>
            addCollectionMovie({
              collectionId: collection.id,
              tmdbId: Number(id),
            }),
          ),
        );
      }

      navigation.goBack();
    } catch {
      Alert.alert(
        '생성 실패',
        '컬렉션을 만들지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }, [
    addCollectionMovie,
    createCollection,
    description,
    name,
    navigation,
    selectedMovieIds,
    selectedThemeId,
    user?.id,
  ]);

  const isSubmitting = isCreating;

  return (
    <AppScreen style={{ paddingTop: insets.top }}>
      <Header title="컬렉션 생성" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <FormContent>
          <ArchivePanel accent>
            <ArchiveSectionHeader
              overline="INFO"
              title="기본 정보"
              subtitle="컬렉션의 이름과 설명을 적어주세요."
            />

            <FieldGroup>
              <FieldLabel>이름</FieldLabel>
              <FieldInput
                value={name}
                onChangeText={setName}
                placeholder="예: 우울할 때 보는 영화"
                placeholderTextColor={theme.colors.placeholderText}
                maxLength={40}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>설명</FieldLabel>
              <FieldTextArea
                value={description}
                onChangeText={setDescription}
                placeholder="이 컬렉션에 담은 이유를 적어보세요."
                placeholderTextColor={theme.colors.placeholderText}
                multiline
                textAlignVertical="top"
                maxLength={200}
              />
            </FieldGroup>
          </ArchivePanel>

          <ArchivePanel accent>
            <ArchiveSectionHeader
              overline="THEME"
              title="컬렉션 테마"
              subtitle="아카이브 표지 분위기를 선택하세요."
            />

            <ThemePreview source={selectedTheme.bgImage} resizeMode="cover" />

            <ThemeGrid>
              {COLLECTION_THEMES.map(themeItem => {
                const isSelected = themeItem.themeId === selectedThemeId;

                return (
                  <ThemeOption
                    key={themeItem.id}
                    $selected={isSelected}
                    onPress={() => setSelectedThemeId(themeItem.themeId)}>
                    <ThemeIcon source={themeItem.icon} resizeMode="contain" />
                  </ThemeOption>
                );
              })}
            </ThemeGrid>
          </ArchivePanel>

          <ArchivePanel accent compact>
            <ArchiveSectionHeader
              overline="FILMS"
              title="영화 추가"
              subtitle="기록한 영화 중 컬렉션에 담을 작품을 고르세요."
            />

            {isMoviesLoading ? (
              <MovieState>
                <ActivityIndicator color={theme.colors.primary} />
              </MovieState>
            ) : userMovies.length === 0 ? (
              <ArchiveEmptyText>
                아직 기록한 영화가 없습니다. 영화를 먼저 기록해주세요.
              </ArchiveEmptyText>
            ) : (
              <LegendList
                data={userMovies}
                extraData={selectedMovieIds}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                  const movieId = String(item.tmdbId);
                  const isSelected = selectedMovieIds.includes(movieId);

                  return (
                    <SelectableMovie onPress={() => toggleMovie(movieId)}>
                      <MovieRowItem movie={toDisplayMovie(item)} />
                      {isSelected ? (
                        <SelectionOverlay>
                          <CheckCircle>
                            <Icon
                              name="check"
                              size={22}
                              color={theme.colors.appBackground}
                            />
                          </CheckCircle>
                        </SelectionOverlay>
                      ) : null}
                    </SelectableMovie>
                  );
                }}
                keyExtractor={item => String(item.tmdbId)}
                estimatedItemSize={122}
                style={{ minHeight: MOVIE_ROW_ITEM_HEIGHT }}
              />
            )}

            {selectedMovieIds.length > 0 ? (
              <SelectedCount>
                {selectedMovieIds.length}편 선택됨
              </SelectedCount>
            ) : null}
          </ArchivePanel>

          <SubmitButton
            onPress={handleSubmit}
            disabled={isSubmitting}
            $disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.appBackground} />
            ) : (
              <SubmitLabel>컬렉션 만들기</SubmitLabel>
            )}
          </SubmitButton>
        </FormContent>
      </ScrollView>
    </AppScreen>
  );
}

export default CollectionScreen;

const FormContent = styled.View`
  padding: 12px 20px 0;
  gap: 14px;
`;

const FieldGroup = styled.View`
  gap: 8px;
  margin-bottom: 14px;
`;

const FieldLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const FieldInput = styled.TextInput`
  min-height: 44px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const FieldTextArea = styled(FieldInput)`
  min-height: 96px;
  padding-top: 12px;
`;

const ThemePreview = styled(Image)`
  width: 100%;
  height: 120px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  margin-bottom: 14px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const ThemeGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const ThemeOption = styled(Pressable)<{ $selected: boolean }>`
  flex: 1;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const ThemeIcon = styled(Image)`
  width: 70%;
  height: 70%;
`;

const MovieState = styled.View`
  height: ${MOVIE_ROW_ITEM_HEIGHT}px;
  align-items: center;
  justify-content: center;
`;

const POSTER_MAT = 3;

const SelectableMovie = styled(Pressable)`
  position: relative;
`;

const SelectionOverlay = styled.View`
  position: absolute;
  top: ${POSTER_MAT}px;
  left: ${POSTER_MAT}px;
  width: ${POSTER_WIDTH}px;
  height: ${POSTER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.radii.poster}px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.58);
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const CheckCircle = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-width: 1.5px;
  border-color: ${({ theme }) => theme.colors.goldSoft};
`;

const SelectedCount = styled.Text`
  margin-top: 10px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const SubmitButton = styled(Pressable)<{ $disabled: boolean }>`
  min-height: 50px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  background-color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.goldDim : theme.colors.primary};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.goldSoft};
`;

const SubmitLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 15px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.appBackground};
`;

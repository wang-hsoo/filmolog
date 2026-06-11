import { LegendList } from '@legendapp/list/react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  ArchiveListFrame,
  ArchiveSearchInput,
  ArchiveSearchPanel,
  ArchiveSectionHeader,
  Header,
} from '../../../components';
import { useAuth } from '../../../lib/supabase/auth';
import {
  useAddCollectionMovie,
  useGetCollectionDetail,
} from '../../../lib/supabase/collection';
import {
  useGetUserReviewedMovies,
  type UserReviewedMovie,
} from '../../../lib/supabase/users';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { AppScreen, theme } from '../../../theme';

type AddMoviesRoute = RouteProp<RootStackParamList, 'CollectionAddMovies'>;

const SEARCH_DEBOUNCE_MS = 200;
const H_PAD = 20;
const LIST_POSTER_WIDTH = 56;
const LIST_POSTER_HEIGHT = 84;
const LIST_ROW_HEIGHT = 112;

function isDuplicateError(error: unknown) {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    String(error.code) === '23505'
  );
}

function formatWatchedDate(date: string | null) {
  if (!date) {
    return null;
  }

  return `시청 · ${date.replace(/-/g, '.')}`;
}

function SelectableMovieRow({
  movie,
  isSelected,
  isLast,
  onPress,
}: {
  movie: UserReviewedMovie;
  isSelected: boolean;
  isLast: boolean;
  onPress: () => void;
}) {
  const posterUri = getTmdbPosterUrl(movie.posterPath);
  const metaLabel = formatWatchedDate(movie.watchedDate);

  return (
    <>
      <MovieRowPressable onPress={onPress} $selected={isSelected}>
        <RowPosterMat>
          {posterUri ? (
            <RowPoster
              source={{ uri: posterUri }}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <RowPosterPlaceholder />
          )}
          {isSelected ? (
            <PosterSelectionOverlay>
              <Icon name="check" size={18} color={theme.colors.appBackground} />
            </PosterSelectionOverlay>
          ) : null}
        </RowPosterMat>

        <RowInfo>
          <RowTitle numberOfLines={2}>{movie.title}</RowTitle>
          {metaLabel ? (
            <RowMeta numberOfLines={1}>{metaLabel}</RowMeta>
          ) : null}
        </RowInfo>

        <RowRatingCol>
          <RowRatingValue>
            <Icon name="star" size={12} color={theme.colors.primary} />
            <RowRatingText>{movie.rating.toFixed(1)}</RowRatingText>
          </RowRatingValue>
          <RowRatingLabel>내 평점</RowRatingLabel>
        </RowRatingCol>

        <SelectionBadge $selected={isSelected}>
          <Icon
            name={isSelected ? 'check-circle' : 'circle-outline'}
            size={22}
            color={
              isSelected ? theme.colors.primary : theme.colors.dashboardIcon
            }
          />
        </SelectionBadge>
      </MovieRowPressable>
      {!isLast ? <RowDivider /> : null}
    </>
  );
}

function CollectionAddMoviesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AddMoviesRoute>();
  const collectionId = route.params.collectionId;
  const { user } = useAuth();

  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: collection, isLoading: isCollectionLoading } =
    useGetCollectionDetail(collectionId);
  const { data: userMovies = [], isLoading: isMoviesLoading } =
    useGetUserReviewedMovies(user?.id ?? '');
  const { mutateAsync: addCollectionMovie, isPending: isAdding } =
    useAddCollectionMovie();

  const existingTmdbIds = useMemo(
    () => new Set(collection?.movies.map(movie => movie.tmdbId) ?? []),
    [collection?.movies],
  );

  const availableMovies = useMemo(
    () => userMovies.filter(movie => !existingTmdbIds.has(movie.tmdbId)),
    [existingTmdbIds, userMovies],
  );

  const filteredMovies = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();

    if (!query) {
      return availableMovies;
    }

    return availableMovies.filter(
      movie =>
        movie.title.toLowerCase().includes(query) ||
        (movie.content?.toLowerCase().includes(query) ?? false),
    );
  }, [availableMovies, debouncedQuery]);

  const toggleMovie = useCallback((movieId: string) => {
    setSelectedMovieIds(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedMovieIds.length === 0) {
      Alert.alert('선택 확인', '추가할 영화를 선택해주세요.');
      return;
    }

    try {
      const results = await Promise.allSettled(
        selectedMovieIds.map(tmdbId =>
          addCollectionMovie({
            collectionId,
            tmdbId: Number(tmdbId),
          }),
        ),
      );

      const failed = results.filter(
        result =>
          result.status === 'rejected' &&
          !isDuplicateError(result.reason),
      );

      if (failed.length > 0) {
        throw failed[0].status === 'rejected' ? failed[0].reason : null;
      }

      navigation.goBack();
    } catch {
      Alert.alert(
        '추가 실패',
        '영화를 컬렉션에 담지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }, [addCollectionMovie, collectionId, navigation, selectedMovieIds]);

  const isLoading = isCollectionLoading || isMoviesLoading;
  const isSubmitting = isAdding;
  const isSearching = debouncedQuery.trim().length > 0;

  const listEmptyMessage = useMemo(() => {
    if (availableMovies.length === 0) {
      return userMovies.length === 0
        ? '아직 기록한 영화가 없습니다. 영화를 먼저 기록해주세요.'
        : '추가할 수 있는 영화가 없습니다. 이미 모두 담았어요.';
    }

    if (isSearching) {
      return `"${debouncedQuery.trim()}"에 맞는 영화가 없습니다.`;
    }

    return '표시할 영화가 없습니다.';
  }, [
    availableMovies.length,
    debouncedQuery,
    isSearching,
    userMovies.length,
  ]);

  return (
    <AppScreen style={{ paddingTop: insets.top }}>
      <Header subtitle="ADD FILMS" navigation={navigation} hideRight />

      <ArchiveSearchPanel>
        <SearchRow>
          <Icon name="magnify" size={20} color={theme.colors.dashboardIcon} />
          <ArchiveSearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="기록한 영화 검색"
            placeholderTextColor={theme.colors.placeholderText}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 ? (
            <ClearButton onPress={() => setSearchQuery('')}>
              <Icon
                name="close-circle"
                size={18}
                color={theme.colors.dashboardIcon}
              />
            </ClearButton>
          ) : null}
        </SearchRow>
      </ArchiveSearchPanel>

      <ListArea>
        {isLoading ? (
          <LoadingState>
            <ActivityIndicator color={theme.colors.primary} />
          </LoadingState>
        ) : (
          <ArchiveListFrame>
            <LegendList
              data={filteredMovies}
              extraData={selectedMovieIds}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: insets.bottom + 88,
                flexGrow: filteredMovies.length === 0 ? 1 : undefined,
              }}
              ListHeaderComponent={
                <ListHeader>
                  <ArchiveSectionHeader
                    overline="MY LOGS"
                    title={collection?.name ?? '컬렉션'}
                    subtitle={
                      isSearching
                        ? `"${debouncedQuery.trim()}" 검색 결과`
                        : '기록한 영화 중 아직 담지 않은 작품을 고르세요.'
                    }
                  />
                  {selectedMovieIds.length > 0 ? (
                    <SelectedCount>
                      {selectedMovieIds.length}편 선택됨
                    </SelectedCount>
                  ) : null}
                </ListHeader>
              }
              ListEmptyComponent={
                <EmptyState>
                  <ArchiveEmptyText>{listEmptyMessage}</ArchiveEmptyText>
                </EmptyState>
              }
              renderItem={({ item, index }) => {
                const movieId = String(item.tmdbId);
                const isSelected = selectedMovieIds.includes(movieId);

                return (
                  <SelectableMovieRow
                    movie={item}
                    isSelected={isSelected}
                    isLast={index === filteredMovies.length - 1}
                    onPress={() => toggleMovie(movieId)}
                  />
                );
              }}
              keyExtractor={item => String(item.tmdbId)}
              estimatedItemSize={LIST_ROW_HEIGHT}
              style={{ flex: 1 }}
            />
          </ArchiveListFrame>
        )}
      </ListArea>

      <SubmitBar style={{ paddingBottom: insets.bottom + 12 }}>
        <SubmitButton
          onPress={handleSubmit}
          disabled={isSubmitting || selectedMovieIds.length === 0}
          $disabled={isSubmitting || selectedMovieIds.length === 0}>
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.appBackground} />
          ) : (
            <SubmitLabel>
              {selectedMovieIds.length > 0
                ? `${selectedMovieIds.length}편 추가`
                : '영화를 선택해주세요'}
            </SubmitLabel>
          )}
        </SubmitButton>
      </SubmitBar>
    </AppScreen>
  );
}

export default CollectionAddMoviesScreen;

const ListArea = styled.View`
  flex: 1;
  padding: 0 ${H_PAD}px;
`;

const SearchRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const ClearButton = styled(Pressable)`
  padding: 2px;
`;

const LoadingState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ListHeader = styled.View`
  padding: 16px 16px 10px;
  gap: 8px;
`;

const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
`;

const MovieRowPressable = styled(Pressable)<{ $selected: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 14px 12px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.surfaceRaised : 'transparent'};
`;

const RowPosterMat = styled.View`
  position: relative;
  width: ${LIST_POSTER_WIDTH}px;
  height: ${LIST_POSTER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.radii.poster + 1}px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const RowPoster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const RowPosterPlaceholder = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const PosterSelectionOverlay = styled.View`
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.55);
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const RowInfo = styled.View`
  flex: 1;
  min-width: 0;
  gap: 4px;
`;

const RowTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 15px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.headerTitle};
`;

const RowMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const RowRatingCol = styled.View`
  align-items: flex-end;
  gap: 3px;
  min-width: 52px;
`;

const RowRatingValue = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 3px;
`;

const RowRatingText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const RowRatingLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const SelectionBadge = styled.View<{ $selected: boolean }>`
  width: 28px;
  align-items: center;
  justify-content: center;
`;

const RowDivider = styled.View`
  height: 1px;
  margin: 0 16px;
  background-color: ${({ theme }) => theme.colors.dashbordItemBorder};
`;

const SelectedCount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const SubmitBar = styled.View`
  position: absolute;
  right: 20px;
  bottom: 0;
  left: 20px;
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

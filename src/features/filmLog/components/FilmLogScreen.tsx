import { LegendList } from '@legendapp/list/react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSearchInput,
  ArchiveSearchPanel,
  ArchiveSectionHeader,
  Header,
  MovieRowItem,
} from '../../../components';
import { useMovieGridLayout } from '../../explore/hooks/useMovieGridLayout';
import { useAuth } from '../../../lib/supabase/auth';
import { useGetCollections } from '../../../lib/supabase/collection';
import { useCreateReview } from '../../../lib/supabase/reviews';
import { useInfiniteSearchMovies, useMovieDetail } from '../../../lib/tmdb';
import type { TmdbMovie } from '../../../lib/tmdb/types';
import { AppScreen, theme } from '../../../theme';

import MovieInfoCard from './MovieInfoCard';
import ReviewForm from './ReviewForm';
import { startOfDay, toDateOnlyString } from '../utils/date';

const SEARCH_DEBOUNCE_MS = 300;
const HORIZONTAL_PADDING = 20;

function FilmLogScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [phase, setPhase] = useState<'search' | 'review'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [watchedDate, setWatchedDate] = useState(() => startOfDay(new Date()));
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    [],
  );

  const gridLayout = useMovieGridLayout({ panelPadding: 16 });
  const { mutateAsync: createReview, isPending: isSubmitting } =
    useCreateReview();
  const { data: collections = [], isLoading: isCollectionsLoading } =
    useGetCollections(user?.id ?? '');
  const {
    data: movieDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useMovieDetail(selectedMovie?.id ?? null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = debouncedQuery.trim().length >= 2;

  const {
    data: searchPages,
    isLoading: isSearchLoading,
    isError: isSearchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchMovies(debouncedQuery);

  const searchResults = useMemo(
    () => searchPages?.pages.flatMap(page => page.results) ?? [],
    [searchPages],
  );

  const handleSelectMovie = useCallback((movie: TmdbMovie) => {
    setSelectedMovie(movie);
    setRating(0);
    setContent('');
    setWatchedDate(startOfDay(new Date()));
    setSelectedCollectionIds([]);
    setPhase('review');
  }, []);

  const handleBackToSearch = useCallback(() => {
    setPhase('search');
    setSelectedMovie(null);
    setRating(0);
    setContent('');
    setWatchedDate(startOfDay(new Date()));
    setSelectedCollectionIds([]);
  }, []);

  const toggleCollection = useCallback((collectionId: string) => {
    setSelectedCollectionIds(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId],
    );
  }, []);

  const handleSearchEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleSubmitReview = useCallback(async () => {
    if (!user?.id || !selectedMovie) {
      return;
    }
    if (rating === 0) {
      Alert.alert('입력 확인', '평점을 선택해주세요.');
      return;
    }

    try {
      await createReview({
        userId: user.id,
        tmdbId: selectedMovie.id,
        title: selectedMovie.title,
        posterPath: selectedMovie.poster_path,
        rating,
        content,
        watchedDate: toDateOnlyString(watchedDate),
        collectionIds: selectedCollectionIds,
      });

      navigation.goBack();
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String(error.code)
          : '';

      if (code === '23505') {
        Alert.alert('이미 기록됨', '이미 리뷰를 작성한 영화입니다.');
        return;
      }

      Alert.alert(
        '저장 실패',
        '영화 기록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }, [
    content,
    createReview,
    navigation,
    rating,
    selectedCollectionIds,
    selectedMovie,
    user?.id,
    watchedDate,
  ]);

  return (
    <AppScreen style={{ paddingTop: insets.top }}>
      <Header
        subtitle={phase === 'search' ? 'NEW LOG' : 'WRITE LOG'}
        navigation={navigation}
        hideRight
      />

      {phase === 'search' ? (
        <SearchContent>
          <ArchiveSearchPanel>
            <SearchRow>
              <Icon
                name="magnify"
                size={20}
                color={theme.colors.dashboardIcon}
              />
              <ArchiveSearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="기록할 영화를 검색하세요"
                placeholderTextColor={theme.colors.placeholderText}
                returnKeyType="search"
                autoCorrect={false}
                autoFocus
              />
            </SearchRow>
          </ArchiveSearchPanel>

          {isSearching ? (
            <ArchiveListFrame>
              <LegendList
                data={searchResults}
                numColumns={gridLayout.numColumns}
                key={gridLayout.numColumns}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  padding: 16,
                  paddingBottom: 28,
                }}
                columnWrapperStyle={{ gap: gridLayout.gridGap }}
                ListHeaderComponent={
                  <View style={{ marginBottom: 14 }}>
                    <ArchiveSectionHeader
                      overline="SEARCH"
                      title="영화 검색"
                      subtitle={`"${debouncedQuery.trim()}" 결과`}
                    />
                  </View>
                }
                ListEmptyComponent={
                  isSearchLoading ? (
                    <SearchState>
                      <ActivityIndicator color={theme.colors.primary} />
                    </SearchState>
                  ) : isSearchError ? (
                    <ArchiveEmptyText>
                      검색 결과를 불러오지 못했습니다.
                    </ArchiveEmptyText>
                  ) : (
                    <ArchiveEmptyText>검색 결과가 없습니다.</ArchiveEmptyText>
                  )
                }
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <FooterLoader>
                      <ActivityIndicator color={theme.colors.primary} />
                    </FooterLoader>
                  ) : null
                }
                renderItem={({ item }) => (
                  <Pressable onPress={() => handleSelectMovie(item)}>
                    <MovieRowItem
                      movie={item}
                      width={gridLayout.itemWidth}
                      variant="grid"
                    />
                  </Pressable>
                )}
                keyExtractor={item => String(item.id)}
                estimatedItemSize={gridLayout.itemHeight}
                onEndReached={handleSearchEndReached}
                onEndReachedThreshold={0.4}
                style={{ flex: 1 }}
              />
            </ArchiveListFrame>
          ) : (
            <HintPanel>
              <ArchiveEmptyText>
                영화 제목을 2자 이상 입력해 검색하세요.
              </ArchiveEmptyText>
            </HintPanel>
          )}
        </SearchContent>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <ReviewContent>
            <ArchivePanel accent>
              <ArchiveSectionHeader
                overline="SELECTED"
                title="기본 정보"
                subtitle="선택한 작품의 정보를 확인하세요."
              />

              {isDetailLoading ? (
                <DetailState>
                  <ActivityIndicator color={theme.colors.primary} />
                </DetailState>
              ) : isDetailError || !movieDetail ? (
                <ArchiveEmptyText>
                  영화 정보를 불러오지 못했습니다.
                </ArchiveEmptyText>
              ) : (
                <MovieInfoCard detail={movieDetail} />
              )}

              <ChangeMovieButton onPress={handleBackToSearch}>
                <ChangeMovieLabel>다른 영화 선택</ChangeMovieLabel>
              </ChangeMovieButton>
            </ArchivePanel>

            <ReviewForm
              rating={rating}
              onRatingChange={setRating}
              content={content}
              onContentChange={setContent}
              watchedDate={watchedDate}
              onWatchedDateChange={setWatchedDate}
              collections={collections}
              isCollectionsLoading={isCollectionsLoading}
              selectedCollectionIds={selectedCollectionIds}
              onToggleCollection={toggleCollection}
            />

            <SubmitButton
              onPress={handleSubmitReview}
              disabled={isSubmitting}
              $disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.appBackground} />
              ) : (
                <SubmitLabel>기록 저장</SubmitLabel>
              )}
            </SubmitButton>
          </ReviewContent>
        </ScrollView>
      )}
    </AppScreen>
  );
}

export default FilmLogScreen;

const SearchContent = styled.View`
  flex: 1;
  padding: 0 ${HORIZONTAL_PADDING}px;
`;

const SearchRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const ArchiveListFrame = styled.View`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const HintPanel = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const SearchState = styled.View`
  padding-top: 48px;
  padding-bottom: 48px;
  align-items: center;
`;

const FooterLoader = styled.View`
  padding-top: 24px;
  padding-bottom: 24px;
  align-items: center;
`;

const ReviewContent = styled.View`
  padding: 12px 20px 0;
  gap: 14px;
`;

const DetailState = styled.View`
  min-height: 120px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const ChangeMovieButton = styled(Pressable)`
  align-self: flex-start;
`;

const ChangeMovieLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
`;

const SubmitButton = styled(Pressable) <{ $disabled: boolean }>`
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

import { LegendList } from '@legendapp/list/react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  ArchiveNativeAd,
  ArchivePanel,
  ArchiveSearchInput,
  ArchiveSearchPanel,
  ArchiveSectionHeader,
  Header,
  MoviePosterNativeAd,
  MovieRowItem,
} from '../../../components';
import { useMovieGridLayout } from '../../explore/hooks/useMovieGridLayout';
import { useAuth } from '../../../lib/supabase/auth';
import { useGetCollections } from '../../../lib/supabase/collection';
import { useCreateReview } from '../../../lib/supabase/reviews';
import { useGetUserReviewedMovies, useGetUserWishlist } from '../../../lib/supabase';
import { useInfiniteSearchMovies, useMovieDetail } from '../../../lib/tmdb';
import {
  extractDirectorSnapshots,
  extractTopCastSnapshots,
} from '../../../lib/tmdb/creditsSnapshot';
import type { TmdbMovie, TmdbMovieDetail } from '../../../lib/tmdb/types';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import { isMovieEntry, withMovieAdSlots } from '../../../lib/ads';
import { AppScreen, theme } from '../../../theme';

import MovieInfoCard from './MovieInfoCard';
import ReviewForm from './ReviewForm';
import WishlistQuickRow from './WishlistQuickRow';
import { startOfDay, toDateOnlyString } from '../utils/date';

const SEARCH_DEBOUNCE_MS = 300;
const HORIZONTAL_PADDING = 20;
const REVIEW_HEADER_OFFSET = 64;
const KEYBOARD_SCROLL_BUFFER = 24;
const SEARCH_AD_INTERVAL = 9;
const SEARCH_MAX_ADS = 5;

type FilmLogRoute = RouteProp<RootStackParamList, 'FilmLog'>;

function toTmdbMovieFromDetail(detail: TmdbMovieDetail): TmdbMovie {
  return {
    id: detail.id,
    title: detail.title,
    original_title: detail.original_title,
    overview: detail.overview,
    poster_path: detail.poster_path,
    backdrop_path: null,
    release_date: detail.release_date,
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: detail.genres.map(genre => genre.id),
    original_language: '',
  };
}

function FilmLogScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<FilmLogRoute>();
  const initialTmdbId = route.params?.tmdbId;
  const { user } = useAuth();
  const hasAppliedInitialMovie = useRef(false);
  const reviewScrollRef = useRef<ScrollView>(null);
  const reviewInputWrapRef = useRef<View>(null);
  const scrollOffsetY = useRef(0);
  const isReviewInputFocused = useRef(false);
  const keyboardHeightRef = useRef(0);

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
    data: wishlist = [],
    isLoading: isWishlistLoading,
    isError: isWishlistError,
  } = useGetUserWishlist(user?.id ?? '');
  const { data: reviewedMovies = [] } = useGetUserReviewedMovies(user?.id ?? '');
  const {
    data: movieDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useMovieDetail(selectedMovie?.id ?? null);
  const { data: initialMovieDetail } = useMovieDetail(initialTmdbId ?? null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const scrollReviewInputIntoView = useCallback((keyboardHeight: number) => {
    if (!isReviewInputFocused.current || keyboardHeight <= 0) {
      return;
    }

    const inputWrap = reviewInputWrapRef.current;
    if (!inputWrap) {
      return;
    }

    requestAnimationFrame(() => {
      inputWrap.measureInWindow((_x, inputY, _w, inputHeight) => {
        const windowHeight = Dimensions.get('window').height;
        const visibleBottom = windowHeight - keyboardHeight;
        const inputBottom = inputY + inputHeight;
        const overflow = inputBottom - visibleBottom + KEYBOARD_SCROLL_BUFFER;

        if (overflow > 0) {
          reviewScrollRef.current?.scrollTo({
            y: scrollOffsetY.current + overflow,
            animated: true,
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    if (phase !== 'review') {
      return undefined;
    }

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      keyboardHeightRef.current = event.endCoordinates.height;
      scrollReviewInputIntoView(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [phase, scrollReviewInputIntoView]);

  const handleReviewInputFocus = useCallback(() => {
    isReviewInputFocused.current = true;

    if (keyboardHeightRef.current > 0) {
      setTimeout(
        () => scrollReviewInputIntoView(keyboardHeightRef.current),
        Platform.OS === 'ios' ? 100 : 150,
      );
    }
  }, [scrollReviewInputIntoView]);

  const handleReviewInputBlur = useCallback(() => {
    isReviewInputFocused.current = false;
  }, []);

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

  const searchListData = useMemo(
    () =>
      withMovieAdSlots(searchResults, {
        interval: SEARCH_AD_INTERVAL,
        maxAds: SEARCH_MAX_ADS,
        idPrefix: `filmlog-search-${debouncedQuery.trim()}`,
      }),
    [debouncedQuery, searchResults],
  );

  const reviewedTmdbIds = useMemo(
    () => new Set(reviewedMovies.map(review => review.tmdbId)),
    [reviewedMovies],
  );

  const wishlistQuickItems = useMemo(
    () => wishlist.filter(item => !reviewedTmdbIds.has(item.tmdbId)),
    [reviewedTmdbIds, wishlist],
  );

  const handleSelectMovie = useCallback((movie: TmdbMovie) => {
    setSelectedMovie(movie);
    setRating(0);
    setContent('');
    setWatchedDate(startOfDay(new Date()));
    setSelectedCollectionIds([]);
    setPhase('review');
  }, []);

  useEffect(() => {
    if (
      hasAppliedInitialMovie.current ||
      !initialTmdbId ||
      !initialMovieDetail
    ) {
      return;
    }

    hasAppliedInitialMovie.current = true;
    handleSelectMovie(toTmdbMovieFromDetail(initialMovieDetail));
  }, [handleSelectMovie, initialMovieDetail, initialTmdbId]);

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
      archiveAlert(
        t('dialogs.validation.title'),
        t('errors.validation.selectRating'),
      );
      return;
    }

    const genreIds =
      movieDetail?.genres.map(genre => genre.id) ??
      selectedMovie.genre_ids ??
      [];
    const releaseDate =
      movieDetail?.release_date ?? selectedMovie.release_date ?? '';
    const releaseYear = releaseDate
      ? Number.parseInt(releaseDate.slice(0, 4), 10)
      : null;
    const originalTitle =
      movieDetail?.original_title ?? selectedMovie.original_title;
    const directors = movieDetail
      ? extractDirectorSnapshots(movieDetail.credits)
      : [];
    const topCast = movieDetail
      ? extractTopCastSnapshots(movieDetail.credits)
      : [];

    try {
      const created = await createReview({
        userId: user.id,
        tmdbId: selectedMovie.id,
        title: selectedMovie.title,
        posterPath: selectedMovie.poster_path,
        genreIds,
        directors,
        topCast,
        releaseYear: Number.isFinite(releaseYear) ? releaseYear : null,
        originalTitle,
        rating,
        content,
        watchedDate: toDateOnlyString(watchedDate),
        collectionIds: selectedCollectionIds,
      });

      navigation.replace('FilmLogComplete', {
        reviewId: created.id,
        title: selectedMovie.title,
        posterPath: selectedMovie.poster_path,
        rating,
        reviewNumber: reviewedMovies.length + 1,
      });
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String(error.code)
          : '';

      if (code === '23505') {
        archiveAlert(
          t('errors.duplicateReview.title'),
          t('errors.duplicateReview.message'),
        );
        return;
      }

      archiveAlert(
        t('errors.saveFailed.generic'),
        t('errors.saveFailed.reviewCreate'),
      );
    }
  }, [
    content,
    createReview,
    movieDetail,
    navigation,
    rating,
    reviewedMovies.length,
    selectedCollectionIds,
    selectedMovie,
    t,
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
          <FilmLogSearchPanel>
            <SearchRow>
              <Icon
                name="magnify"
                size={20}
                color={theme.colors.dashboardIcon}
              />
              <ArchiveSearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('filmLog.search.placeholder')}
                placeholderTextColor={theme.colors.placeholderText}
                returnKeyType="search"
                autoCorrect={false}
                autoFocus
              />
            </SearchRow>
          </FilmLogSearchPanel>

          {!isSearching ? (
            <WishlistQuickRow
              items={wishlistQuickItems}
              isLoading={isWishlistLoading}
              isError={isWishlistError}
              onSelectMovie={handleSelectMovie}
            />
          ) : null}

          
          <ArchivePanel>
            <ArchiveNativeAd />
          </ArchivePanel>


          {isSearching ? (
            <ArchiveListFrame>
              <LegendList
                data={searchListData}
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
                      title={t('filmLog.search.title')}
                      subtitle={t('common.archive.searchResultsFor', {
                        query: debouncedQuery.trim(),
                      })}
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
                      {t('filmLog.search.loadFailed')}
                    </ArchiveEmptyText>
                  ) : (
                    <ArchiveEmptyText>
                      {t('filmLog.search.noResults')}
                    </ArchiveEmptyText>
                  )
                }
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <FooterLoader>
                      <ActivityIndicator color={theme.colors.primary} />
                    </FooterLoader>
                  ) : null
                }
                renderItem={({ item }) =>
                  isMovieEntry(item) ? (
                    <Pressable onPress={() => handleSelectMovie(item.movie)}>
                      <MovieRowItem
                        movie={item.movie}
                        width={gridLayout.itemWidth}
                        variant="grid"
                      />
                    </Pressable>
                  ) : (
                    <MoviePosterNativeAd
                      width={gridLayout.itemWidth}
                      variant="grid"
                    />
                  )
                }
                keyExtractor={item => item.id}
                estimatedItemSize={gridLayout.itemHeight}
                onEndReached={handleSearchEndReached}
                onEndReachedThreshold={0.4}
                style={{ flex: 1 }}
              />
            </ArchiveListFrame>
          ) : (
            <HintPanel $compact={wishlistQuickItems.length > 0}>
              <ArchiveEmptyText>{t('filmLog.search.hint')}</ArchiveEmptyText>
            </HintPanel>
          )}
        </SearchContent>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? insets.top + REVIEW_HEADER_OFFSET : 0
          }>
          <ScrollView
            ref={reviewScrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            onScroll={event => {
              scrollOffsetY.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 24,
            }}>
            <ReviewContent>
              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="SELECTED"
                  title={t('filmLog.selected.title')}
                  subtitle={t('filmLog.selected.subtitle')}
                />

                {isDetailLoading ? (
                  <DetailState>
                    <ActivityIndicator color={theme.colors.primary} />
                  </DetailState>
                ) : isDetailError || !movieDetail ? (
                  <ArchiveEmptyText>
                    {t('filmLog.selected.loadFailed')}
                  </ArchiveEmptyText>
                ) : (
                  <MovieInfoCard detail={movieDetail} />
                )}

                <ChangeMovieButton onPress={handleBackToSearch}>
                  <ChangeMovieLabel>
                    {t('filmLog.selected.changeMovie')}
                  </ChangeMovieLabel>
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
                reviewInputWrapRef={reviewInputWrapRef}
                onReviewInputFocus={handleReviewInputFocus}
                onReviewInputBlur={handleReviewInputBlur}
              />

              <SubmitButton
                onPress={handleSubmitReview}
                disabled={isSubmitting}
                $disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.appBackground} />
                ) : (
                  <SubmitLabel>{t('filmLog.form.submit')}</SubmitLabel>
                )}
              </SubmitButton>
            </ReviewContent>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </AppScreen>
  );
}

export default FilmLogScreen;

const SearchContent = styled.View`
  flex: 1;
  gap: 12px;
  padding: 0 ${HORIZONTAL_PADDING}px;
`;

const FilmLogSearchPanel = styled(ArchiveSearchPanel)`
  margin-left: 0;
  margin-right: 0;
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

const HintPanel = styled.View<{ $compact?: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ $compact }) => ($compact ? '16px 0' : '40px 0')};
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

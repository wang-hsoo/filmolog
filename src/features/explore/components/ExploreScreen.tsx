import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { LegendList } from '@legendapp/list/react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveContent,
  ArchiveEmptyText,
  ArchiveListFrame,
  ArchivePageHeader,
  ArchivePanel,
  ArchiveSearchInput,
  ArchiveSearchPanel,
  ArchiveSectionHeader,
  Container,
  MoviePosterNativeAd,
  MovieRowItem,
  MOVIE_ROW_ITEM_HEIGHT,
} from '../../../components';
import { isMovieEntry, withMovieAdSlots } from '../../../lib/ads';
import { queryClient } from '../../../lib/queryClient';
import {
  communityExploreKeys,
  useAuth,
  useCommunityMostCollected,
  useCommunityMostReviewed,
  useCommunityTopRatedByGenres,
  useCommunityTopRatedForMe,
  useGetUserFavoriteGenres,
} from '../../../lib/supabase';
import { useDiscoverMovies, useInfiniteSearchMovies } from '../../../lib/tmdb';
import type { TmdbMovie } from '../../../lib/tmdb/types';
import { theme } from '../../../theme';
import { useStatsPersonRecommendations } from '../../statistics/hooks/useStatsPersonRecommendations';
import { useMovieGridLayout } from '../hooks/useMovieGridLayout';

import ExploreMovieShelf from './ExploreMovieShelf';

const SEARCH_DEBOUNCE_MS = 300;
const HORIZONTAL_PADDING = 20;
const CURATION_AD_INTERVAL = 6;
const SEARCH_AD_INTERVAL = 9;
const SEARCH_MAX_ADS = 5;

function ExploreScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [feedKey, setFeedKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      setFeedKey(key => key + 1);
      void queryClient.invalidateQueries({
        queryKey: communityExploreKeys.all,
      });
    }, []),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = debouncedQuery.trim().length >= 2;
  const gridLayout = useMovieGridLayout({
    panelPadding: isSearching ? 16 : 0,
  });

  const userId = user?.id ?? '';

  const { data: favoriteGenres, isLoading: isGenresLoading } =
    useGetUserFavoriteGenres(userId);
  const genreIds = favoriteGenres?.preferred_genres ?? [];

  const {
    data: discoverMovies,
    isLoading: isMoviesLoading,
    isError: isMoviesError,
  } = useDiscoverMovies(genreIds, feedKey);

  const {
    data: topRatedForMe = [],
    isLoading: isTopRatedLoading,
    isError: isTopRatedError,
  } = useCommunityTopRatedForMe(userId);

  const {
    data: topRatedByGenres = [],
    isLoading: isGenreTopRatedLoading,
    isError: isGenreTopRatedError,
  } = useCommunityTopRatedByGenres(userId, genreIds);

  const {
    data: mostReviewed = [],
    isLoading: isMostReviewedLoading,
    isError: isMostReviewedError,
  } = useCommunityMostReviewed(userId);

  const {
    data: mostCollected = [],
    isLoading: isMostCollectedLoading,
    isError: isMostCollectedError,
  } = useCommunityMostCollected(userId);

  const {
    topDirector,
    topCast,
    directorRecommendMovies,
    castRecommendMovies,
    isDirectorCreditsLoading,
    isDirectorCreditsError,
    isCastCreditsLoading,
    isCastCreditsError,
  } = useStatsPersonRecommendations(userId);

  const {
    data: searchPages,
    isLoading: isSearchLoading,
    isError: isSearchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchMovies(debouncedQuery);

  const recommendMovies = discoverMovies?.results ?? [];
  const searchMovies = useMemo(
    () => searchPages?.pages.flatMap(page => page.results) ?? [],
    [searchPages],
  );

  const curationListData = useMemo(
    () =>
      withMovieAdSlots(recommendMovies, {
        interval: CURATION_AD_INTERVAL,
        maxAds: 1,
        idPrefix: 'curation',
      }),
    [recommendMovies],
  );

  const searchListData = useMemo(
    () =>
      withMovieAdSlots(searchMovies, {
        interval: SEARCH_AD_INTERVAL,
        maxAds: SEARCH_MAX_ADS,
        idPrefix: `search-${debouncedQuery.trim()}`,
      }),
    [debouncedQuery, searchMovies],
  );

  const isRecommendLoading = isGenresLoading || isMoviesLoading;

  const handleSearchEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePressMovie = useCallback(
    (movie: TmdbMovie) => {
      navigation.navigate('MovieDetail', { tmdbId: movie.id });
    },
    [navigation],
  );

  const searchField = (
    <SearchRow>
      <Icon name="magnify" size={20} color={theme.colors.dashboardIcon} />
      <ArchiveSearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('explore.searchPlaceholder')}
        placeholderTextColor={theme.colors.placeholderText}
        returnKeyType="search"
        autoCorrect={false}
      />
    </SearchRow>
  );

  const recommendContent = (
    <ArchiveContent>
      <ArchivePanel accent compact>
        <ArchiveSectionHeader
          overline="CURATION"
          title={t('explore.curation.title')}
          subtitle={t('explore.curation.subtitle')}
        />

        {isRecommendLoading ? (
          <ListPlaceholder>
            <ActivityIndicator color={theme.colors.primary} />
          </ListPlaceholder>
        ) : genreIds.length === 0 ? (
          <ArchiveEmptyText>{t('explore.curation.setGenresFirst')}</ArchiveEmptyText>
        ) : isMoviesError ? (
          <ArchiveEmptyText>{t('explore.curation.loadFailed')}</ArchiveEmptyText>
        ) : recommendMovies.length === 0 ? (
          <ArchiveEmptyText>{t('explore.curation.noMatches')}</ArchiveEmptyText>
        ) : (
          <LegendList
            data={curationListData}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) =>
              isMovieEntry(item) ? (
                <MovieRowItem
                  movie={item.movie}
                  onPress={() => handlePressMovie(item.movie)}
                />
              ) : (
                <MoviePosterNativeAd variant="row" />
              )
            }
            keyExtractor={item => item.id}
            estimatedItemSize={122}
            style={{ height: MOVIE_ROW_ITEM_HEIGHT }}
          />
        )}
      </ArchivePanel>

      {topDirector ? (
        <ExploreMovieShelf
          overline="YOUR TASTE"
          title={t('explore.directorShelf.title', { name: topDirector.name })}
          subtitle={t('explore.directorShelf.subtitle')}
          movies={directorRecommendMovies}
          isLoading={isDirectorCreditsLoading}
          isError={isDirectorCreditsError}
          hideWhenEmpty
          onPressMovie={handlePressMovie}
        />
      ) : null}

      {topCast ? (
        <ExploreMovieShelf
          overline="YOUR TASTE"
          title={t('explore.castShelf.title', { name: topCast.name })}
          subtitle={t('explore.castShelf.subtitle')}
          movies={castRecommendMovies}
          isLoading={isCastCreditsLoading}
          isError={isCastCreditsError}
          hideWhenEmpty
          onPressMovie={handlePressMovie}
        />
      ) : null}

      <ExploreMovieShelf
        overline="FILMOLOG PICKS"
        title={t('explore.communityTopRated.title')}
        subtitle={t('explore.communityTopRated.subtitle')}
        movies={topRatedForMe}
        isLoading={isTopRatedLoading}
        isError={isTopRatedError}
        showRating
        hideWhenEmpty
        onPressMovie={handlePressMovie}
      />

      {genreIds.length > 0 ? (
        <ExploreMovieShelf
          overline="YOUR GENRE"
          title={t('explore.genreTopRated.title')}
          subtitle={t('explore.genreTopRated.subtitle')}
          movies={topRatedByGenres}
          isLoading={isGenreTopRatedLoading}
          isError={isGenreTopRatedError}
          showRating
          emptyMessage={t('explore.genreTopRated.empty')}
          hideWhenEmpty
          onPressMovie={handlePressMovie}
        />
      ) : null}

      <ExploreMovieShelf
        overline="TRENDING LOGS"
        title={t('explore.mostLogged.title')}
        subtitle={t('explore.mostLogged.subtitle')}
        movies={mostReviewed}
        isLoading={isMostReviewedLoading}
        isError={isMostReviewedError}
        hideWhenEmpty
        onPressMovie={handlePressMovie}
      />

      <ExploreMovieShelf
        overline="COLLECTED"
        title={t('explore.mostCollected.title')}
        subtitle={t('explore.mostCollected.subtitle')}
        movies={mostCollected}
        isLoading={isMostCollectedLoading}
        isError={isMostCollectedError}
        hideWhenEmpty
        onPressMovie={handlePressMovie}
      />

    </ArchiveContent>
  );

  return (
    <Root>
      <ArchivePageHeader
        title={t('explore.header.title')}
        subtitle={t('explore.header.subtitle')}
      />

      <ArchiveSearchPanel>{searchField}</ArchiveSearchPanel>

      {isSearching ? (
        <SearchContent>
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
                    title={t('explore.search.title')}
                    subtitle={t('common.archive.searchResultsArchive', {
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
                    {t('explore.search.loadFailed')}
                  </ArchiveEmptyText>
                ) : (
                  <ArchiveEmptyText>
                    {t('explore.search.notFound')}
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
                  <MovieRowItem
                    movie={item.movie}
                    width={gridLayout.itemWidth}
                    variant="grid"
                    onPress={() => handlePressMovie(item.movie)}
                  />
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
        </SearchContent>
      ) : (
        <Container isGetter={false}>{recommendContent}</Container>
      )}
    </Root>
  );
}

export default ExploreScreen;

const Root = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.appBackground};
`;

const SearchContent = styled.View`
  flex: 1;
  padding: 0 ${HORIZONTAL_PADDING}px;
`;

const SearchRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const ListPlaceholder = styled.View`
  height: ${MOVIE_ROW_ITEM_HEIGHT}px;
  align-items: center;
  justify-content: center;
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

import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { LegendList } from '@legendapp/list/react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
  MovieRowItem,
  MOVIE_ROW_ITEM_HEIGHT,
} from '../../../components';
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
import { useMovieGridLayout } from '../hooks/useMovieGridLayout';

import ExploreMovieShelf from './ExploreMovieShelf';

const SEARCH_DEBOUNCE_MS = 300;
const HORIZONTAL_PADDING = 20;

function ExploreScreen() {
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
        placeholder="컬렉션에서 작품 검색"
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
          title="당신을 위한 큐레이션"
          subtitle="선호 장르로 엄선한 작품을 아카이브에 담았습니다."
        />

        {isRecommendLoading ? (
          <ListPlaceholder>
            <ActivityIndicator color={theme.colors.primary} />
          </ListPlaceholder>
        ) : genreIds.length === 0 ? (
          <ArchiveEmptyText>선호 장르를 먼저 설정해주세요.</ArchiveEmptyText>
        ) : isMoviesError ? (
          <ArchiveEmptyText>영화 목록을 불러오지 못했습니다.</ArchiveEmptyText>
        ) : recommendMovies.length === 0 ? (
          <ArchiveEmptyText>조건에 맞는 작품이 없습니다.</ArchiveEmptyText>
        ) : (
          <LegendList
            data={recommendMovies}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <MovieRowItem movie={item} onPress={() => handlePressMovie(item)} />
            )}
            keyExtractor={item => String(item.id)}
            estimatedItemSize={122}
            style={{ height: MOVIE_ROW_ITEM_HEIGHT }}
          />
        )}
      </ArchivePanel>

      <ExploreMovieShelf
        overline="FILMOLOG PICKS"
        title="커뮤니티 고평점"
        subtitle="Filmolog 유저들이 높게 평가한 작품."
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
          title="내 장르, Filmolog 고평점"
          subtitle="선호 장르 × 커뮤니티 평점."
          movies={topRatedByGenres}
          isLoading={isGenreTopRatedLoading}
          isError={isGenreTopRatedError}
          showRating
          emptyMessage="장르 데이터가 쌓이면 추천이 표시됩니다. 리뷰를 작성해주세요."
          hideWhenEmpty
          onPressMovie={handlePressMovie}
        />
      ) : null}

      <ExploreMovieShelf
        overline="TRENDING LOGS"
        title="많이 기록된 작품"
        subtitle="Filmolog에서 가장 많이 리뷰된 영화."
        movies={mostReviewed}
        isLoading={isMostReviewedLoading}
        isError={isMostReviewedError}
        hideWhenEmpty
        onPressMovie={handlePressMovie}
      />

      <ExploreMovieShelf
        overline="COLLECTED"
        title="많이 담긴 작품"
        subtitle="컬렉션에 자주 담긴 영화."
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
        title="탐색"
        subtitle="기록되지 않은 걸작을, 나만의 아카이브에서 찾아보세요."
      />

      <ArchiveSearchPanel>{searchField}</ArchiveSearchPanel>

      {isSearching ? (
        <SearchContent>
          <ArchiveListFrame>
            <LegendList
              data={searchMovies}
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
                    title="아카이브 검색"
                    subtitle={`"${debouncedQuery.trim()}" 에 대한 기록`}
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
                  <ArchiveEmptyText>
                    아카이브에서 해당 작품을 찾지 못했습니다.
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
              renderItem={({ item }) => (
                <MovieRowItem
                  movie={item}
                  width={gridLayout.itemWidth}
                  variant="grid"
                  onPress={() => handlePressMovie(item)}
                />
              )}
              keyExtractor={item => String(item.id)}
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

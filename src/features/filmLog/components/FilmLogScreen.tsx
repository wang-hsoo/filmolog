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
import WatchedDateCalendar from './WatchedDateCalendar';
import {
  addDays,
  formatWatchedDateLabel,
  isSameDay,
  startOfDay,
  toDateOnlyString,
} from '../utils/date';

const SEARCH_DEBOUNCE_MS = 300;
const HORIZONTAL_PADDING = 20;
const STAR_VALUES = [1, 2, 3, 4, 5] as const;
const STAR_SIZE = 36;

function getStarIconName(star: number, rating: number) {
  if (rating >= star) {
    return 'star';
  }
  if (rating >= star - 0.5) {
    return 'star-half-full';
  }
  return 'star-outline';
}

function formatRating(rating: number) {
  return Number.isInteger(rating) ? `${rating}.0` : String(rating);
}

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

  const today = useMemo(() => startOfDay(new Date()), []);

  const handleSelectMovie = useCallback((movie: TmdbMovie) => {
    setSelectedMovie(movie);
    setRating(0);
    setContent('');
    setWatchedDate(startOfDay(new Date()));
    setSelectedCollectionIds([]);
    setIsCalendarOpen(false);
    setPhase('review');
  }, []);

  const handleBackToSearch = useCallback(() => {
    setPhase('search');
    setSelectedMovie(null);
    setRating(0);
    setContent('');
    setWatchedDate(startOfDay(new Date()));
    setSelectedCollectionIds([]);
    setIsCalendarOpen(false);
  }, []);

  const toggleCollection = useCallback((collectionId: string) => {
    setSelectedCollectionIds(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId],
    );
  }, []);

  const handleShiftWatchedDate = useCallback(
    (days: number) => {
      const nextDate = addDays(watchedDate, days);
      if (nextDate > today) {
        return;
      }
      setWatchedDate(nextDate);
    },
    [today, watchedDate],
  );

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
        title={phase === 'search' ? '영화 기록' : '리뷰 작성'}
        navigation={navigation}
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

            <ArchivePanel accent>
              <ArchiveSectionHeader
                overline="WATCHED"
                title="시청일"
                subtitle="언제 이 작품을 보셨나요?"
              />

              <QuickDateRow>
                <QuickDateButton
                  $active={isSameDay(watchedDate, today)}
                  onPress={() => setWatchedDate(today)}>
                  <QuickDateLabel $active={isSameDay(watchedDate, today)}>
                    오늘
                  </QuickDateLabel>
                </QuickDateButton>
                <QuickDateButton
                  $active={isSameDay(watchedDate, addDays(today, -1))}
                  onPress={() => setWatchedDate(addDays(today, -1))}>
                  <QuickDateLabel
                    $active={isSameDay(watchedDate, addDays(today, -1))}>
                    어제
                  </QuickDateLabel>
                </QuickDateButton>
              </QuickDateRow>

              <DatePickerRow>
                <DateShiftButton
                  onPress={() => handleShiftWatchedDate(-1)}
                  accessibilityLabel="하루 전">
                  <Icon
                    name="chevron-left"
                    size={22}
                    color={theme.colors.dashboardIcon}
                  />
                </DateShiftButton>
                <DateValueButton onPress={() => setIsCalendarOpen(true)}>
                  <DateValue>{formatWatchedDateLabel(watchedDate)}</DateValue>
                  <Icon
                    name="calendar-month-outline"
                    size={18}
                    color={theme.colors.dashboardIcon}
                  />
                </DateValueButton>
                <DateShiftButton
                  onPress={() => handleShiftWatchedDate(1)}
                  disabled={isSameDay(watchedDate, today)}
                  accessibilityLabel="하루 후">
                  <Icon
                    name="chevron-right"
                    size={22}
                    color={
                      isSameDay(watchedDate, today)
                        ? theme.colors.goldDim
                        : theme.colors.dashboardIcon
                    }
                  />
                </DateShiftButton>
              </DatePickerRow>
            </ArchivePanel>

            <ArchivePanel accent>
              <ArchiveSectionHeader
                overline="RATING"
                title="평점"
                subtitle="별 왼쪽은 0.5점, 오른쪽은 1점 단위예요."
              />

              <RatingRow>
                {STAR_VALUES.map(star => {
                  const isActive = rating >= star - 0.5;
                  const iconName = getStarIconName(star, rating);

                  return (
                    <StarWrap key={star}>
                      <StarTapHalf
                        onPress={() => setRating(star - 0.5)}
                        accessibilityLabel={`${star - 0.5}점`}
                      />
                      <StarTapFull
                        onPress={() => setRating(star)}
                        accessibilityLabel={`${star}점`}
                      />
                      <Icon
                        name={iconName}
                        size={32}
                        color={
                          isActive
                            ? theme.colors.primary
                            : theme.colors.goldDim
                        }
                      />
                    </StarWrap>
                  );
                })}
              </RatingRow>
              <RatingValue>
                {rating > 0 ? formatRating(rating) : '평점을 선택하세요'}
              </RatingValue>
            </ArchivePanel>

            <ArchivePanel accent>
              <ArchiveSectionHeader
                overline="REVIEW"
                title="한줄평 · 감상"
                subtitle="짧은 메모도 좋아요."
              />

              <ReviewInput
                value={content}
                onChangeText={setContent}
                placeholder="이 영화에 대한 생각을 적어보세요."
                placeholderTextColor={theme.colors.placeholderText}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />
            </ArchivePanel>

            <ArchivePanel accent>
              <ArchiveSectionHeader
                overline="COLLECTION"
                title="컬렉션에 담기"
                subtitle="선택한 컬렉션에 이 작품을 바로 추가해요."
              />

              {isCollectionsLoading ? (
                <CollectionState>
                  <ActivityIndicator color={theme.colors.primary} />
                </CollectionState>
              ) : collections.length === 0 ? (
                <ArchiveEmptyText>
                  아직 컬렉션이 없습니다. 기록만 저장하거나 컬렉션을 먼저
                  만들어주세요.
                </ArchiveEmptyText>
              ) : (
                <CollectionList>
                  {collections.map(collection => {
                    const isSelected = selectedCollectionIds.includes(
                      collection.id,
                    );

                    return (
                      <CollectionItem
                        key={collection.id}
                        $selected={isSelected}
                        onPress={() => toggleCollection(collection.id)}>
                        <Icon
                          name={
                            isSelected
                              ? 'checkbox-marked'
                              : 'checkbox-blank-outline'
                          }
                          size={20}
                          color={
                            isSelected
                              ? theme.colors.primary
                              : theme.colors.goldDim
                          }
                        />
                        <CollectionName>{collection.name}</CollectionName>
                      </CollectionItem>
                    );
                  })}
                </CollectionList>
              )}
            </ArchivePanel>

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

      <WatchedDateCalendar
        visible={isCalendarOpen}
        value={watchedDate}
        maxDate={today}
        onClose={() => setIsCalendarOpen(false)}
        onSelect={setWatchedDate}
      />
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

const QuickDateRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
`;

const QuickDateButton = styled(Pressable) <{ $active: boolean }>`
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const QuickDateLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 13px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.goldBright : theme.colors.dashboardText};
`;

const DatePickerRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const DateShiftButton = styled(Pressable)`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const DateValueButton = styled(Pressable)`
  min-width: 148px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const DateValue = styled.Text`
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const CollectionState = styled.View`
  min-height: 72px;
  align-items: center;
  justify-content: center;
`;

const CollectionList = styled.View`
  gap: 8px;
`;

const CollectionItem = styled(Pressable) <{ $selected: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const CollectionName = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const RatingRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 6px;
`;

const StarWrap = styled.View`
  width: ${STAR_SIZE}px;
  height: ${STAR_SIZE}px;
  align-items: center;
  justify-content: center;
`;

const StarTapHalf = styled(Pressable)`
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 1;
`;

const StarTapFull = styled(Pressable)`
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 1;
`;

const RatingValue = styled.Text`
  margin-top: 10px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const ReviewInput = styled.TextInput`
  min-height: 140px;
  padding: 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 15px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.goldSoft};
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

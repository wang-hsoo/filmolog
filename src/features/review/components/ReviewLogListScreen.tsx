import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import { ArchiveBannerAd, ArchiveEmptyText, Header } from '../../../components';
import { useAuth, useGetUserReviewedMovies } from '../../../lib/supabase';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';
import { AppScreen, theme } from '../../../theme';

import ReviewLogCalendarView from './ReviewLogCalendarView';
import ReviewLogRow from './ReviewLogRow';
import ReviewLogTimelineView from './ReviewLogTimelineView';
import {
  REVIEW_PERIOD_OPTIONS,
  REVIEW_SORT_OPTIONS,
  REVIEW_VIEW_OPTIONS,
  filterReviewsByPeriod,
  groupReviewsByDate,
  sortReviews,
  type ReviewLogPeriodKey,
  type ReviewLogViewMode,
  type ReviewSortKey,
} from '../utils/reviewLogUtils';

const H_PAD = 20;
const MIN_REVIEWS_FOR_BANNER = 15;

function ReviewLogListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ReviewLogViewMode>('list');
  const [periodKey, setPeriodKey] = useState<ReviewLogPeriodKey>('all');
  const [sortKey, setSortKey] = useState<ReviewSortKey>('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  const { data: reviews = [], isLoading } = useGetUserReviewedMovies(
    user?.id ?? '',
  );

  const periodFilteredReviews = useMemo(
    () => filterReviewsByPeriod(reviews, periodKey),
    [periodKey, reviews],
  );

  const sortedReviews = useMemo(
    () => sortReviews(periodFilteredReviews, sortKey),
    [periodFilteredReviews, sortKey],
  );

  const timelineGroups = useMemo(
    () => groupReviewsByDate(periodFilteredReviews, sortKey),
    [periodFilteredReviews, sortKey],
  );

  const activeSortLabel =
    REVIEW_SORT_OPTIONS.find(option => option.key === sortKey)?.label ??
    '최신 기록순';

  const activePeriodLabel =
    REVIEW_PERIOD_OPTIONS.find(option => option.key === periodKey)?.label ??
    '전체 기간';

  const handlePressReview = useCallback(
    (review: UserReviewedMovie) => {
      navigation.navigate('ReviewDetail', { reviewId: review.reviewId });
    },
    [navigation],
  );

  const handleSelectSort = useCallback((key: ReviewSortKey) => {
    setSortKey(key);
    setIsSortOpen(false);
  }, []);

  const handleSelectPeriod = useCallback((key: ReviewLogPeriodKey) => {
    setPeriodKey(key);
    setIsPeriodOpen(false);
  }, []);

  const showSortControl = viewMode !== 'calendar';

  return (
    <AppScreen style={{ paddingTop: insets.top }}>
      <Header subtitle="MY LOGS" navigation={navigation} hideRight />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}>
        <ToolbarRow>
          <ToolbarTitle>나의 기록</ToolbarTitle>
          <ToolbarMeta>{periodFilteredReviews.length}편</ToolbarMeta>
        </ToolbarRow>

        <ViewTabRow>
          {REVIEW_VIEW_OPTIONS.map(option => {
            const isActive = viewMode === option.key;

            return (
              <ViewTab
                key={option.key}
                $active={isActive}
                onPress={() => setViewMode(option.key)}>
                <ViewTabLabel $active={isActive}>{option.label}</ViewTabLabel>
              </ViewTab>
            );
          })}
        </ViewTabRow>

        <FilterRow>
          <FilterChip onPress={() => setIsPeriodOpen(true)}>
            <FilterChipLabel>기간 · {activePeriodLabel}</FilterChipLabel>
            <Icon
              name="chevron-down"
              size={14}
              color={theme.colors.dashboardText}
            />
          </FilterChip>

          {showSortControl ? (
            <FilterChip onPress={() => setIsSortOpen(true)}>
              <FilterChipLabel>정렬 · {activeSortLabel}</FilterChipLabel>
              <Icon
                name="chevron-down"
                size={14}
                color={theme.colors.dashboardText}
              />
            </FilterChip>
          ) : null}
        </FilterRow>

        {isLoading ? (
          <LoadingState>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </LoadingState>
        ) : periodFilteredReviews.length === 0 ? (
          <EmptyState>
            <ArchiveEmptyText>
              {reviews.length === 0
                ? '아직 남긴 기록이 없습니다. 첫 영화를 기록해보세요.'
                : '선택한 기간에 해당하는 기록이 없습니다.'}
            </ArchiveEmptyText>
          </EmptyState>
        ) : (
          <ContentFrame>
            {viewMode === 'list' ? (
              <ListFrame>
                {sortedReviews.map((review, index) => (
                  <ReviewLogRow
                    key={review.reviewId}
                    review={review}
                    isLast={index === sortedReviews.length - 1}
                    onPress={() => handlePressReview(review)}
                  />
                ))}
              </ListFrame>
            ) : null}

            {viewMode === 'timeline' ? (
              <ReviewLogTimelineView
                groups={timelineGroups}
                onPressReview={handlePressReview}
              />
            ) : null}

            {viewMode === 'calendar' ? (
              <ReviewLogCalendarView
                reviews={periodFilteredReviews}
                onPressReview={handlePressReview}
              />
            ) : null}

            {periodFilteredReviews.length >= MIN_REVIEWS_FOR_BANNER ? (
              <BannerSlot>
                <ArchiveBannerAd />
              </BannerSlot>
            ) : null}
          </ContentFrame>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={isSortOpen}
        animationType="fade"
        onRequestClose={() => setIsSortOpen(false)}>
        <SortModalRoot>
          <SortBackdrop onPress={() => setIsSortOpen(false)} />
          <SortSheet>
            {REVIEW_SORT_OPTIONS.map((option, index) => (
              <SortOption
                key={option.key}
                $isLast={index === REVIEW_SORT_OPTIONS.length - 1}
                $active={sortKey === option.key}
                onPress={() => handleSelectSort(option.key)}>
                <SortOptionLabel $active={sortKey === option.key}>
                  {option.label}
                </SortOptionLabel>
                {sortKey === option.key ? (
                  <Icon name="check" size={16} color={theme.colors.primary} />
                ) : null}
              </SortOption>
            ))}
          </SortSheet>
        </SortModalRoot>
      </Modal>

      <Modal
        transparent
        visible={isPeriodOpen}
        animationType="fade"
        onRequestClose={() => setIsPeriodOpen(false)}>
        <SortModalRoot>
          <SortBackdrop onPress={() => setIsPeriodOpen(false)} />
          <SortSheet>
            {REVIEW_PERIOD_OPTIONS.map((option, index) => (
              <SortOption
                key={option.key}
                $isLast={index === REVIEW_PERIOD_OPTIONS.length - 1}
                $active={periodKey === option.key}
                onPress={() => handleSelectPeriod(option.key)}>
                <SortOptionLabel $active={periodKey === option.key}>
                  {option.label}
                </SortOptionLabel>
                {periodKey === option.key ? (
                  <Icon name="check" size={16} color={theme.colors.primary} />
                ) : null}
              </SortOption>
            ))}
          </SortSheet>
        </SortModalRoot>
      </Modal>
    </AppScreen>
  );
}

export default ReviewLogListScreen;

const ToolbarRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  padding: 8px ${H_PAD}px 10px;
  gap: 12px;
`;

const ToolbarTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const ToolbarMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const ViewTabRow = styled.View`
  flex-direction: row;
  gap: 8px;
  padding: 0 ${H_PAD}px 12px;
`;

const ViewTab = styled(Pressable)<{ $active: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryMuted : theme.colors.dashborderBorder};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.dashboardBackground};
`;

const ViewTabLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme, $active }) =>
    $active ? theme.fonts.bodySemiBold : theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.2px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.goldBright : theme.colors.dashboardText};
`;

const FilterRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 ${H_PAD}px 14px;
`;

const FilterChip = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const FilterChipLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const LoadingState = styled.View`
  flex: 1;
  min-height: 200px;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.View`
  padding: 48px ${H_PAD}px;
  align-items: center;
`;

const ContentFrame = styled.View`
  padding: 0 ${H_PAD}px;
  gap: 20px;
`;

const ListFrame = styled.View`
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 4px 14px;
`;

const BannerSlot = styled.View`
  margin-top: 4px;
`;

const SortModalRoot = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const SortBackdrop = styled(Pressable)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
`;

const SortSheet = styled.View`
  margin: 0 ${H_PAD}px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const SortOption = styled.Pressable<{ $isLast: boolean; $active: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.dashboardBackground};
`;

const SortOptionLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme, $active }) =>
    $active ? theme.fonts.bodySemiBold : theme.fonts.body};
  font-size: 14px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.goldBright : theme.colors.goldSoft};
`;

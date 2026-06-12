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
import { ArchiveEmptyText, Header } from '../../../components';
import { useAuth, useGetUserReviewedMovies } from '../../../lib/supabase';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';
import { AppScreen, theme } from '../../../theme';

import ReviewLogRow from './ReviewLogRow';

const H_PAD = 20;

type ReviewSortKey =
  | 'latest'
  | 'oldest'
  | 'ratingDesc'
  | 'ratingAsc'
  | 'watchedDesc';

const SORT_OPTIONS: { key: ReviewSortKey; label: string }[] = [
  { key: 'latest', label: '최신 기록순' },
  { key: 'oldest', label: '오래된 기록순' },
  { key: 'ratingDesc', label: '평점 높은순' },
  { key: 'ratingAsc', label: '평점 낮은순' },
  { key: 'watchedDesc', label: '관람일 최신순' },
];

function sortReviews(
  items: UserReviewedMovie[],
  sortKey: ReviewSortKey,
): UserReviewedMovie[] {
  const sorted = [...items];

  switch (sortKey) {
    case 'latest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case 'ratingDesc':
      return sorted.sort(
        (a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt),
      );
    case 'ratingAsc':
      return sorted.sort(
        (a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt),
      );
    case 'watchedDesc':
      return sorted.sort((a, b) => {
        const aDate = a.watchedDate ?? a.createdAt.slice(0, 10);
        const bDate = b.watchedDate ?? b.createdAt.slice(0, 10);
        return bDate.localeCompare(aDate);
      });
    default:
      return sorted;
  }
}

function ReviewLogListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<ReviewSortKey>('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const { data: reviews = [], isLoading } = useGetUserReviewedMovies(
    user?.id ?? '',
  );

  const sortedReviews = useMemo(
    () => sortReviews(reviews, sortKey),
    [reviews, sortKey],
  );

  const activeSortLabel =
    SORT_OPTIONS.find(option => option.key === sortKey)?.label ?? '최신 기록순';

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
          <SortTrigger onPress={() => setIsSortOpen(true)}>
            <SortLabel>정렬: {activeSortLabel}</SortLabel>
            <Icon
              name="chevron-down"
              size={16}
              color={theme.colors.dashboardText}
            />
          </SortTrigger>
        </ToolbarRow>

        {isLoading ? (
          <LoadingState>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </LoadingState>
        ) : sortedReviews.length === 0 ? (
          <EmptyState>
            <ArchiveEmptyText>
              아직 남긴 기록이 없습니다. 첫 영화를 기록해보세요.
            </ArchiveEmptyText>
          </EmptyState>
        ) : (
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
            {SORT_OPTIONS.map((option, index) => (
              <SortOption
                key={option.key}
                $isLast={index === SORT_OPTIONS.length - 1}
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
    </AppScreen>
  );
}

export default ReviewLogListScreen;

const ToolbarRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px ${H_PAD}px 14px;
`;

const ToolbarTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const SortTrigger = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 0;
`;

const SortLabel = styled.Text`
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

const ListFrame = styled.View`
  margin: 0 ${H_PAD}px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 4px 14px;
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

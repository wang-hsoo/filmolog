import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, type View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  ArchiveNativeAd,
  ArchivePanel,
  Header,
} from '../../../components';
import { useAuth, useCachedUserReviewedMovies, useGetUserReviewedMovies } from '../../../lib/supabase';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';
import { AppScreen, theme } from '../../../theme';
import { getReviewSortOptions, getReviewViewOptions } from '../../../i18n/labels';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import { startOfDay } from '../../filmLog/utils/date';

import ReviewCalendarExportBar from './ReviewCalendarExportBar';
import ReviewCalendarPreviewModal from './ReviewCalendarPreviewModal';
import ReviewCalendarShareCard from './ReviewCalendarShareCard';
import ReviewLogCalendarView from './ReviewLogCalendarView';
import ReviewLogDateFilter from './ReviewLogDateFilter';
import ReviewLogRow from './ReviewLogRow';
import ReviewLogTimelineView from './ReviewLogTimelineView';
import {
  filterReviewsByYearMonth,
  getAvailableLogYears,
  groupReviewsByDate,
  resolveCalendarFocusMonth,
  sortReviews,
  type ReviewLogMonthFilter,
  type ReviewLogViewMode,
  type ReviewLogYearFilter,
  type ReviewSortKey,
} from '../utils/reviewLogUtils';
import { buildCalendarShareModel } from '../utils/calendarShareExport';
import { prefetchMonthReviewPosters } from '../utils/prefetchReviewPosters';
import { shareCalendarGalleryImage } from '../utils/shareCalendarGallery';

import ReviewLogLoadingView from './ReviewLogLoadingView';

const H_PAD = 20;

function ReviewLogListScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const cachedReviews = useCachedUserReviewedMovies(user?.id);
  const shareCardRef = useRef<View>(null);
  const [viewMode, setViewMode] = useState<ReviewLogViewMode>('calendar');
  const [yearFilter, setYearFilter] = useState<ReviewLogYearFilter>('all');
  const [monthFilter, setMonthFilter] = useState<ReviewLogMonthFilter>('all');
  const [sortKey, setSortKey] = useState<ReviewSortKey>('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCalendarExporting, setIsCalendarExporting] = useState(false);
  const [isCalendarPreviewOpen, setIsCalendarPreviewOpen] = useState(false);
  const [calendarVisibleMonth, setCalendarVisibleMonth] = useState(() => {
    const today = startOfDay(new Date());
    return startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
  });

  const {
    data: reviews,
    isLoading: isReviewsLoading,
  } = useGetUserReviewedMovies(user?.id ?? '');

  const hasReviewData = reviews !== undefined || cachedReviews !== undefined;
  const isLogsLoading = !hasReviewData && isReviewsLoading;

  const resolvedReviews = reviews ?? cachedReviews ?? [];

  const availableYears = useMemo(() => getAvailableLogYears(resolvedReviews), [resolvedReviews]);

  const filteredReviews = useMemo(
    () => filterReviewsByYearMonth(resolvedReviews, yearFilter, monthFilter),
    [monthFilter, resolvedReviews, yearFilter],
  );

  const sortedReviews = useMemo(
    () => sortReviews(filteredReviews, sortKey),
    [filteredReviews, sortKey],
  );

  const timelineGroups = useMemo(
    () => groupReviewsByDate(filteredReviews, sortKey),
    [filteredReviews, sortKey],
  );

  const calendarFocusMonth = useMemo(
    () => resolveCalendarFocusMonth(yearFilter, monthFilter),
    [monthFilter, yearFilter],
  );

  useEffect(() => {
    if (calendarFocusMonth) {
      setCalendarVisibleMonth(calendarFocusMonth);
    }
  }, [calendarFocusMonth]);

  useEffect(() => {
    if (isLogsLoading || filteredReviews.length === 0) {
      return;
    }

    prefetchMonthReviewPosters(filteredReviews, calendarVisibleMonth);
  }, [calendarVisibleMonth, filteredReviews, isLogsLoading]);

  const calendarShareModel = useMemo(
    () =>
      buildCalendarShareModel({
        reviews: filteredReviews,
        visibleMonth: calendarVisibleMonth,
        t,
        footerTagline: t('review.calendar.footerTagline'),
      }),
    [calendarVisibleMonth, filteredReviews, t],
  );

  const sortOptions = useMemo(() => getReviewSortOptions(t), [t]);
  const viewOptions = useMemo(() => getReviewViewOptions(t), [t]);

  const activeSortLabel =
    sortOptions.find(option => option.key === sortKey)?.label ??
    t('common.sort.latestLog');

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

  const handleYearChange = useCallback((value: ReviewLogYearFilter) => {
    setYearFilter(value);
    setMonthFilter('all');
  }, []);

  const handleVisibleMonthChange = useCallback((month: Date) => {
    setCalendarVisibleMonth(month);
  }, []);

  const handleOpenCalendarPreview = useCallback(() => {
    if (!calendarShareModel.canExport) {
      archiveAlert(
        t('review.calendar.saveImage'),
        t('review.calendar.saveEmpty'),
      );
      return;
    }

    setIsCalendarPreviewOpen(true);
  }, [calendarShareModel.canExport, t]);

  const handleShareCalendar = useCallback(async () => {
    if (!calendarShareModel.canExport) {
      archiveAlert(
        t('review.calendar.shareImage'),
        t('review.calendar.saveEmpty'),
      );
      return;
    }

    setIsCalendarExporting(true);

    try {
      await shareCalendarGalleryImage(
        shareCardRef,
        calendarShareModel.shareMessage,
      );
    } catch {
      // 사용자가 공유 시트를 닫은 경우 등은 무시
    } finally {
      setIsCalendarExporting(false);
    }
  }, [calendarShareModel.canExport, calendarShareModel.shareMessage, t]);

  const showSortControl = viewMode !== 'calendar';
  const showCalendarExport = viewMode === 'calendar';

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
          <ToolbarTitle>{t('review.list.title')}</ToolbarTitle>
          <ToolbarMeta>
            {isLogsLoading
              ? '…'
              : t('common.units.filmCount', { count: filteredReviews.length })}
          </ToolbarMeta>
        </ToolbarRow>

        <ViewTabRow>
          {viewOptions.map(option => {
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

        <ReviewLogDateFilter
          years={availableYears}
          yearFilter={yearFilter}
          monthFilter={monthFilter}
          onYearChange={handleYearChange}
          onMonthChange={setMonthFilter}
        />

        {showCalendarExport && !isLogsLoading ? (
          <ReviewCalendarExportBar
            disabled={!calendarShareModel.canExport}
            isBusy={isCalendarExporting}
            onPressSave={handleOpenCalendarPreview}
            onPressShare={handleShareCalendar}
          />
        ) : null}

        {showSortControl ? (
          <SortFilterRow>
            <FilterChip onPress={() => setIsSortOpen(true)}>
              <FilterChipLabel>
                {t('common.sort.sortChipPrefix', { label: activeSortLabel })}
              </FilterChipLabel>
              <Icon
                name="chevron-down"
                size={14}
                color={theme.colors.dashboardText}
              />
            </FilterChip>
          </SortFilterRow>
        ) : null}

        {isLogsLoading ? (
          <ReviewLogLoadingView />
        ) : filteredReviews.length === 0 ? (
          <EmptyState>
            <ArchiveEmptyText>
              {resolvedReviews.length === 0
                ? t('review.list.emptyAll')
                : t('review.list.emptyPeriod')}
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
                reviews={filteredReviews}
                onPressReview={handlePressReview}
                focusMonth={calendarFocusMonth}
                onVisibleMonthChange={handleVisibleMonthChange}
              />
            ) : null}

            <ArchivePanel>
              <ArchiveNativeAd />
            </ArchivePanel>
          </ContentFrame>
        )}
      </ScrollView>

      {showCalendarExport && calendarShareModel.canExport ? (
        <ShareCardHost pointerEvents="none">
          <ReviewCalendarShareCard
            ref={shareCardRef}
            {...calendarShareModel.shareCardProps}
          />
        </ShareCardHost>
      ) : null}

      <ReviewCalendarPreviewModal
        visible={isCalendarPreviewOpen}
        onClose={() => setIsCalendarPreviewOpen(false)}
        shareCardProps={calendarShareModel.shareCardProps}
        shareMessage={calendarShareModel.shareMessage}
        monthTitle={calendarShareModel.shareCardProps.monthTitle}
      />

      <Modal
        transparent
        visible={isSortOpen}
        animationType="fade"
        onRequestClose={() => setIsSortOpen(false)}>
        <SortModalRoot>
          <SortBackdrop onPress={() => setIsSortOpen(false)} />
          <SortSheet>
            {sortOptions.map((option, index) => (
              <SortOption
                key={option.key}
                $isLast={index === sortOptions.length - 1}
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

const SortFilterRow = styled.View`
  padding: 0 ${H_PAD}px 14px;
`;

const FilterChip = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
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

const SortModalRoot = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const SortBackdrop = styled.Pressable`
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

const ShareCardHost = styled.View`
  position: absolute;
  top: -10000px;
  left: 0;
  opacity: 0;
`;

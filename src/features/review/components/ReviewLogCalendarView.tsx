import { useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { ArchiveEmptyText } from '../../../components';
import {
  formatWatchedDateWithWeekdayLocalized,
  getWeekdayLabels,
} from '../../../i18n/labels';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';
import { theme } from '../../../theme';
import {
  addMonths,
  buildCalendarCells,
  formatWatchedDateLabel,
  isAfterDay,
  isSameDay,
  isSameMonth,
  startOfDay,
  toDateOnlyString,
} from '../../filmLog/utils/date';

import {
  filterReviewsInMonth,
  filterReviewsOnDate,
  getReviewDateKey,
  indexReviewsByDate,
} from '../utils/reviewLogUtils';

type ReviewLogCalendarViewProps = {
  reviews: UserReviewedMovie[];
  onPressReview: (review: UserReviewedMovie) => void;
};

function formatRating(rating: number) {
  return rating.toFixed(1);
}

type CalendarPosterDayProps = {
  date: Date;
  dayReviews: UserReviewedMovie[];
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  onPress: () => void;
};

function CalendarPosterDay({
  date,
  dayReviews,
  isSelected,
  isToday,
  isFuture,
  onPress,
}: CalendarPosterDayProps) {
  const hasReview = dayReviews.length > 0;
  const primaryReview = dayReviews[0];
  const secondaryReview = dayReviews[1];
  const posterUri = getTmdbPosterUrl(primaryReview?.posterPath ?? null, 'w154');
  const secondaryPosterUri = getTmdbPosterUrl(
    secondaryReview?.posterPath ?? null,
    'w154',
  );

  return (
    <DayCell>
      <DayButton
        onPress={onPress}
        $selected={isSelected}
        $today={isToday}
        $hasReview={hasReview}
        $isFuture={isFuture}>
        {hasReview ? (
          <PosterStack>
            {secondaryPosterUri ? (
              <BackPoster
                source={{ uri: secondaryPosterUri }}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : null}
            {posterUri ? (
              <FrontPoster
                source={{ uri: posterUri }}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <FrontPosterPlaceholder />
            )}
            <DayOverlay $selected={isSelected}>
              <DayOverlayLabel $selected={isSelected}>
                {date.getDate()}
              </DayOverlayLabel>
            </DayOverlay>
            {dayReviews.length > 1 ? (
              <CountBadge $selected={isSelected}>
                <CountBadgeText>+{dayReviews.length - 1}</CountBadgeText>
              </CountBadge>
            ) : null}
          </PosterStack>
        ) : (
          <EmptySlot $today={isToday} $isFuture={isFuture}>
            <EmptySlotIcon
              name={isFuture ? 'calendar-blank-outline' : 'movie-open-plus-outline'}
              size={14}
              color={
                isToday
                  ? theme.colors.primaryMuted
                  : theme.colors.dashborderBorder
              }
            />
            <EmptyDayLabel $today={isToday} $isFuture={isFuture}>
              {date.getDate()}
            </EmptyDayLabel>
          </EmptySlot>
        )}
      </DayButton>
    </DayCell>
  );
}

type PosterMosaicTileProps = {
  review: UserReviewedMovie;
  onPress: () => void;
};

function PosterMosaicTile({ review, onPress }: PosterMosaicTileProps) {
  const posterUri = getTmdbPosterUrl(review.posterPath, 'w154');

  return (
    <MosaicTile onPress={onPress}>
      <MosaicPosterMat>
        {posterUri ? (
          <MosaicPoster
            source={{ uri: posterUri }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <MosaicPosterPlaceholder />
        )}
      </MosaicPosterMat>
      <MosaicMeta>
        <MosaicTitle numberOfLines={2}>{review.title}</MosaicTitle>
        <MosaicRatingRow>
          <Icon name="star" size={10} color={theme.colors.primary} />
          <MosaicRating>{formatRating(review.rating)}</MosaicRating>
        </MosaicRatingRow>
      </MosaicMeta>
    </MosaicTile>
  );
}

function ReviewLogCalendarView({
  reviews,
  onPressReview,
}: ReviewLogCalendarViewProps) {
  const { t } = useTranslation();
  const weekdayLabels = useMemo(() => getWeekdayLabels(t), [t]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const reviewsByDate = useMemo(() => indexReviewsByDate(reviews), [reviews]);

  const cells = useMemo(
    () => buildCalendarCells(visibleMonth, today),
    [today, visibleMonth],
  );

  const canGoNextMonth = !isSameMonth(visibleMonth, today);

  const monthReviews = useMemo(
    () => filterReviewsInMonth(reviews, visibleMonth),
    [reviews, visibleMonth],
  );

  const dayReviews = useMemo(() => {
    if (!selectedDateKey) {
      return monthReviews;
    }

    return filterReviewsOnDate(reviews, selectedDateKey);
  }, [monthReviews, reviews, selectedDateKey]);

  const monthProgress = useMemo(() => {
    const daysInMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    ).getDate();
    const isCurrentMonth = isSameMonth(visibleMonth, today);
    const eligibleDays = isCurrentMonth ? today.getDate() : daysInMonth;
    const filledDays = new Set(
      monthReviews.map(review => getReviewDateKey(review)),
    ).size;
    const ratio = eligibleDays > 0 ? filledDays / eligibleDays : 0;

    return {
      daysInMonth,
      eligibleDays,
      filledDays,
      reviewCount: monthReviews.length,
      ratio,
    };
  }, [monthReviews, today, visibleMonth]);

  const handleSelectDay = (date: Date) => {
    const dateKey = toDateOnlyString(date);
    setSelectedDateKey(prev => (prev === dateKey ? null : dateKey));
  };

  const sectionTitle = selectedDateKey
    ? formatWatchedDateWithWeekdayLocalized(t, selectedDateKey)
    : t('common.calendar.yearMonthPosterWall', {
        year: visibleMonth.getFullYear(),
        month: visibleMonth.getMonth() + 1,
      });

  return (
    <CalendarRoot>
      <CalendarPanel>
        <MonthHeader>
          <MonthShiftButton
            onPress={() => {
              setVisibleMonth(prev => addMonths(prev, -1));
              setSelectedDateKey(null);
            }}>
            <Icon
              name="chevron-left"
              size={22}
              color={theme.colors.dashboardIcon}
            />
          </MonthShiftButton>

          <MonthTitleBlock>
            <MonthTitle>
              {t('common.calendar.yearMonth', {
                year: visibleMonth.getFullYear(),
                month: visibleMonth.getMonth() + 1,
              })}
            </MonthTitle>
            <MonthSubtitle>
              {t('common.units.monthProgress', {
                filledDays: monthProgress.filledDays,
                eligibleDays: monthProgress.eligibleDays,
                reviewCount: monthProgress.reviewCount,
              })}
            </MonthSubtitle>
          </MonthTitleBlock>

          <MonthShiftButton
            disabled={!canGoNextMonth}
            onPress={() => {
              if (canGoNextMonth) {
                setVisibleMonth(prev => addMonths(prev, 1));
                setSelectedDateKey(null);
              }
            }}>
            <Icon
              name="chevron-right"
              size={22}
              color={
                canGoNextMonth
                  ? theme.colors.dashboardIcon
                  : theme.colors.goldDim
              }
            />
          </MonthShiftButton>
        </MonthHeader>

        <ProgressTrack>
          <ProgressFill $ratio={monthProgress.ratio} />
        </ProgressTrack>
        <ProgressCaption>
          {monthProgress.ratio >= 1
            ? t('review.calendar.monthComplete')
            : t('review.calendar.tagline')}
        </ProgressCaption>

        <WeekdayRow>
          {weekdayLabels.map(label => (
            <WeekdayLabel key={label}>{label}</WeekdayLabel>
          ))}
        </WeekdayRow>

        <CalendarGrid>
          {cells.map(cell => {
            if (!cell.date) {
              return <DayPlaceholder key={cell.key} />;
            }

            const dateKey = toDateOnlyString(cell.date);
            const dayBucket = reviewsByDate.get(dateKey) ?? [];

            return (
              <CalendarPosterDay
                key={cell.key}
                date={cell.date}
                dayReviews={dayBucket}
                isSelected={selectedDateKey === dateKey}
                isToday={isSameDay(cell.date, today)}
                isFuture={isAfterDay(cell.date, today)}
                onPress={() => handleSelectDay(cell.date!)}
              />
            );
          })}
        </CalendarGrid>

        <CalendarHint>
          {selectedDateKey
            ? t('review.calendar.selectedHint', {
                date: formatWatchedDateLabel(
                  startOfDay(
                    new Date(
                      Number.parseInt(selectedDateKey.slice(0, 4), 10),
                      Number.parseInt(selectedDateKey.slice(5, 7), 10) - 1,
                      Number.parseInt(selectedDateKey.slice(8, 10), 10),
                    ),
                  ),
                ),
              })
            : t('review.calendar.hint')}
        </CalendarHint>
      </CalendarPanel>

      <DaySection>
        <DaySectionHeader>
          <DaySectionTitle>{sectionTitle}</DaySectionTitle>
          <DaySectionCount>
            {t('common.units.filmCount', { count: dayReviews.length })}
          </DaySectionCount>
        </DaySectionHeader>

        {dayReviews.length === 0 ? (
          <DayEmpty>
            <ArchiveEmptyText>
              {selectedDateKey
                ? t('review.calendar.emptyDay')
                : t('review.calendar.emptyMonth')}
            </ArchiveEmptyText>
          </DayEmpty>
        ) : (
          <PosterMosaic>
            {dayReviews.map(review => (
              <PosterMosaicTile
                key={review.reviewId}
                review={review}
                onPress={() => onPressReview(review)}
              />
            ))}
          </PosterMosaic>
        )}
      </DaySection>
    </CalendarRoot>
  );
}

export default ReviewLogCalendarView;

const CalendarRoot = styled.View`
  gap: 14px;
`;

const CalendarPanel = styled.View`
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 14px 10px 12px;
`;

const MonthHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const MonthShiftButton = styled.Pressable`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const MonthTitleBlock = styled.View`
  flex: 1;
  align-items: center;
  gap: 2px;
`;

const MonthTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 17px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const MonthSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const ProgressTrack = styled.View`
  height: 4px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressFill = styled.View<{ $ratio: number }>`
  width: ${({ $ratio }) => `${Math.min(Math.max($ratio, 0), 1) * 100}%`};
  height: 100%;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const ProgressCaption = styled.Text`
  margin-bottom: 10px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const WeekdayRow = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
  padding: 0 1px;
`;

const WeekdayLabel = styled.Text`
  width: 14.2857%;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const CalendarGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 3px 0;
`;

const DayCell = styled.View`
  width: 14.2857%;
  padding: 1px;
`;

const DayPlaceholder = styled.View`
  width: 14.2857%;
  aspect-ratio: 0.68;
`;

const DayButton = styled.Pressable<{
  $selected: boolean;
  $today: boolean;
  $hasReview: boolean;
  $isFuture: boolean;
}>`
  aspect-ratio: 0.68;
  border-radius: ${({ theme }) => theme.radii.poster}px;
  overflow: hidden;
  border-width: ${({ $selected, $today, $hasReview }) =>
    $selected || $today ? 1.5 : $hasReview ? 1 : 1}px;
  border-style: ${({ $hasReview }) => ($hasReview ? 'solid' : 'dashed')};
  border-color: ${({ theme, $selected, $today, $hasReview }) => {
    if ($selected) {
      return theme.colors.primary;
    }
    if ($today) {
      return theme.colors.primaryMuted;
    }
    if ($hasReview) {
      return theme.colors.posterBorder;
    }
    return theme.colors.dashborderBorder;
  }};
  opacity: ${({ $isFuture, $hasReview }) =>
    $isFuture && !$hasReview ? 0.55 : 1};
  transform: ${({ $selected }) => ($selected ? 'scale(1.03)' : 'scale(1)')};
`;

const PosterStack = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const BackPoster = styled(FastImage)`
  position: absolute;
  top: 3px;
  left: 7px;
  right: 3px;
  bottom: 3px;
  border-radius: ${({ theme }) => theme.radii.poster - 1}px;
  opacity: 0.72;
`;

const FrontPoster = styled(FastImage)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const FrontPosterPlaceholder = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const DayOverlay = styled.View<{ $selected: boolean }>`
  position: absolute;
  top: 3px;
  left: 3px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : 'rgba(8, 8, 7, 0.72)'};
`;

const DayOverlayLabel = styled.Text<{ $selected: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.appBackground : theme.colors.goldBright};
  ${Platform.OS === 'android' ? 'include-font-padding: false;' : ''}
`;

const CountBadge = styled.View<{ $selected: boolean }>`
  position: absolute;
  right: 3px;
  bottom: 3px;
  min-width: 18px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.appBackground : 'rgba(8, 8, 7, 0.82)'};
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primaryMuted : theme.colors.posterBorder};
`;

const CountBadgeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 9px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const EmptySlot = styled.View<{ $today: boolean; $isFuture: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: ${({ theme, $today }) =>
    $today ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const EmptySlotIcon = styled(Icon)``;

const EmptyDayLabel = styled.Text<{ $today: boolean; $isFuture: boolean }>`
  font-family: ${({ theme, $today }) =>
    $today ? theme.fonts.bodySemiBold : theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme, $today, $isFuture }) => {
    if ($today) {
      return theme.colors.goldBright;
    }
    if ($isFuture) {
      return theme.colors.goldDim;
    }
    return theme.colors.dashboardText;
  }};
`;

const CalendarHint = styled.Text`
  margin-top: 10px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const DaySection = styled.View`
  gap: 10px;
`;

const DaySectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
`;

const DaySectionTitle = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const DaySectionCount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const PosterMosaic = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

const MosaicTile = styled.Pressable`
  width: 31.2%;
  gap: 6px;
`;

const MosaicPosterMat = styled.View`
  width: 100%;
  aspect-ratio: 0.68;
  padding: 3px;
  border-radius: ${({ theme }) => theme.radii.poster + 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const MosaicPoster = styled(FastImage)`
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.poster}px;
`;

const MosaicPosterPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.poster}px;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const MosaicMeta = styled.View`
  gap: 3px;
  padding: 0 2px;
`;

const MosaicTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 11px;
  line-height: 14px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const MosaicRatingRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
`;

const MosaicRating = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const DayEmpty = styled.View`
  padding: 28px 16px;
  align-items: center;
`;

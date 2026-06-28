import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { getWeekdayLabels } from '../../../i18n/labels';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { theme } from '../../../theme';

import type { ReviewLogDateGroup } from '../utils/reviewLogUtils';

const POSTER_WIDTH = 44;
const POSTER_HEIGHT = 66;

type ReviewLogTimelineViewProps = {
  groups: ReviewLogDateGroup[];
  onPressReview: (review: UserReviewedMovie) => void;
};

type DateStampParts = {
  day: string;
  yearMonth: string;
  weekday: string;
};

function parseDateStamp(
  dateKey: string,
  weekdays: string[],
): DateStampParts | null {
  const [year, month, day] = dateKey.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  return {
    day: String(day),
    yearMonth: `${year}.${String(month).padStart(2, '0')}`,
    weekday: weekdays[date.getDay()] ?? '',
  };
}

function formatRating(rating: number) {
  return rating.toFixed(1);
}

type TimelineEntryProps = {
  review: UserReviewedMovie;
  onPress: () => void;
};

function TimelineEntry({ review, onPress }: TimelineEntryProps) {
  const posterUri = getTmdbPosterUrl(review.posterPath);

  return (
    <EntryCard onPress={onPress} accessibilityRole="button">
      <PosterMat>
        {posterUri ? (
          <Poster
            source={{ uri: posterUri }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <PosterPlaceholder />
        )}
      </PosterMat>
      <EntryBody>
        <EntryTitle numberOfLines={2}>{review.title}</EntryTitle>
        <EntryMetaRow>
          <RatingWrap>
            <Icon name="star" size={12} color={theme.colors.primary} />
            <RatingText>{formatRating(review.rating)}</RatingText>
          </RatingWrap>
        </EntryMetaRow>
        {review.content?.trim() ? (
          <EntryNote numberOfLines={2}>{review.content.trim()}</EntryNote>
        ) : null}
      </EntryBody>
      <Icon name="chevron-right" size={18} color={theme.colors.primaryMuted} />
    </EntryCard>
  );
}

function ReviewLogTimelineView({
  groups,
  onPressReview,
}: ReviewLogTimelineViewProps) {
  const { t } = useTranslation();
  const weekdays = getWeekdayLabels(t);

  return (
    <TimelineRoot>
      {groups.map((group, groupIndex) => {
        const stamp = parseDateStamp(group.dateKey, weekdays);
        const isLastGroup = groupIndex === groups.length - 1;

        return (
          <TimelineGroup key={group.dateKey}>
            <GroupRow>
              <RailColumn>
                <RailDot />
                {!isLastGroup ? <RailLine /> : null}
              </RailColumn>

              <GroupContent>
                <DatePlate>
                  {stamp ? (
                    <>
                      <DayBlock>
                        <DayNumber>{stamp.day}</DayNumber>
                        <DayMeta>
                          <YearMonth>{stamp.yearMonth}</YearMonth>
                          <WeekdayPill>
                            <WeekdayLabel>{stamp.weekday}</WeekdayLabel>
                          </WeekdayPill>
                        </DayMeta>
                      </DayBlock>
                      <CountBadge>
                        <CountBadgeLabel>
                          {t('common.units.filmCount', {
                            count: group.reviews.length,
                          })}
                        </CountBadgeLabel>
                      </CountBadge>
                    </>
                  ) : null}
                </DatePlate>

                <EntriesColumn>
                  {group.reviews.map(review => (
                    <TimelineEntry
                      key={review.reviewId}
                      review={review}
                      onPress={() => onPressReview(review)}
                    />
                  ))}
                </EntriesColumn>
              </GroupContent>
            </GroupRow>
          </TimelineGroup>
        );
      })}
    </TimelineRoot>
  );
}

export default ReviewLogTimelineView;

const TimelineRoot = styled.View`
  padding: 4px 0 8px;
`;

const TimelineGroup = styled.View`
  margin-bottom: 4px;
`;

const GroupRow = styled.View`
  flex-direction: row;
  align-items: stretch;
`;

const RailColumn = styled.View`
  width: 28px;
  align-items: center;
  padding-top: 18px;
`;

const RailDot = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

const RailLine = styled.View`
  flex: 1;
  width: 2px;
  min-height: 24px;
  margin-top: 4px;
  margin-bottom: -8px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;

const GroupContent = styled.View`
  flex: 1;
  min-width: 0;
  padding-bottom: 20px;
  gap: 10px;
`;

const DatePlate = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

const DayBlock = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const DayNumber = styled.Text`
  min-width: 36px;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 32px;
  line-height: 36px;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const DayMeta = styled.View`
  gap: 6px;
`;

const YearMonth = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 14px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const WeekdayPill = styled.View`
  align-self: flex-start;
  padding: 3px 8px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const WeekdayLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary};
`;

const CountBadge = styled.View`
  padding: 6px 10px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const CountBadgeLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const EntriesColumn = styled.View`
  gap: 8px;
  padding-left: 2px;
`;

const EntryCard = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
`;

const PosterMat = styled.View`
  width: ${POSTER_WIDTH + 6}px;
  height: ${POSTER_HEIGHT + 6}px;
  padding: 3px;
  border-radius: ${({ theme }) => theme.radii.poster + 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const Poster = styled(FastImage)`
  width: ${POSTER_WIDTH}px;
  height: ${POSTER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.radii.poster}px;
`;

const PosterPlaceholder = styled.View`
  width: ${POSTER_WIDTH}px;
  height: ${POSTER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.radii.poster}px;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const EntryBody = styled.View`
  flex: 1;
  min-width: 0;
  gap: 4px;
`;

const EntryTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  line-height: 19px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const EntryMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const RatingWrap = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 3px;
`;

const RatingText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const EntryNote = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  line-height: 17px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

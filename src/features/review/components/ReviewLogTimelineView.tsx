import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';

import { formatWatchedDateWithWeekdayLocalized } from '../../../i18n/labels';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';

import type { ReviewLogDateGroup } from '../utils/reviewLogUtils';

import ReviewLogRow from './ReviewLogRow';

type ReviewLogTimelineViewProps = {
  groups: ReviewLogDateGroup[];
  onPressReview: (review: UserReviewedMovie) => void;
};

function ReviewLogTimelineView({
  groups,
  onPressReview,
}: ReviewLogTimelineViewProps) {
  const { t } = useTranslation();

  return (
    <TimelineRoot>
      {groups.map(group => (
        <TimelineGroup key={group.dateKey}>
          <TimelineHeader>
            <TimelineDate>
              {formatWatchedDateWithWeekdayLocalized(t, group.dateKey)}
            </TimelineDate>
            <TimelineCount>
              {t('common.units.filmCount', { count: group.reviews.length })}
            </TimelineCount>
          </TimelineHeader>

          <TimelineCard>
            {group.reviews.map((review, index) => (
              <ReviewLogRow
                key={review.reviewId}
                review={review}
                isLast={index === group.reviews.length - 1}
                onPress={() => onPressReview(review)}
              />
            ))}
          </TimelineCard>
        </TimelineGroup>
      ))}
    </TimelineRoot>
  );
}

export default ReviewLogTimelineView;

const TimelineRoot = styled.View`
  gap: 16px;
`;

const TimelineGroup = styled.View`
  gap: 8px;
`;

const TimelineHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const TimelineDate = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const TimelineCount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const TimelineCard = styled.View`
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 4px 14px;
`;

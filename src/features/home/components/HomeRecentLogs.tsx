import { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSectionHeader,
} from '../../../components';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';
import { theme } from '../../../theme';

import ReviewLogRow from '../../review/components/ReviewLogRow';

const HOME_RECENT_LIMIT = 5;

type HomeRecentLogsProps = {
  reviews: UserReviewedMovie[];
  isLoading: boolean;
  onViewAll?: () => void;
  onPressReview?: (review: UserReviewedMovie) => void;
};

function HomeRecentLogs({
  reviews,
  isLoading,
  onViewAll,
  onPressReview,
}: HomeRecentLogsProps) {
  const { t } = useTranslation();
  const recentReviews = useMemo(
    () => reviews.slice(0, HOME_RECENT_LIMIT),
    [reviews],
  );

  const showViewAll = !!onViewAll && reviews.length > 0;

  return (
    <ArchivePanel accent compact>
      <SectionHeaderRow>
        <HeaderFrame>
          <ArchiveSectionHeader
            overline="RECENT LOG"
            title={t('common.archive.recentLog.title')}
            subtitle={t('common.archive.recentLog.subtitle')}
          />
        </HeaderFrame>
        {showViewAll ? (
          <ViewAllButton onPress={onViewAll}>
            <ViewAllLabel>{t('common.actions.viewAll')}</ViewAllLabel>
            <ViewAllChevron>›</ViewAllChevron>
          </ViewAllButton>
        ) : null}
      </SectionHeaderRow>

      {isLoading ? (
        <LoadingState>
          <ActivityIndicator color={theme.colors.primary} />
        </LoadingState>
      ) : recentReviews.length === 0 ? (
        <ArchiveEmptyText>{t('home.empty.noLogs')}</ArchiveEmptyText>
      ) : (
        <LogList>
          {recentReviews.map((review, index) => (
            <ReviewLogRow
              key={review.reviewId}
              review={review}
              isLast={index === recentReviews.length - 1}
              onPress={() => onPressReview?.(review)}
            />
          ))}
        </LogList>
      )}
    </ArchivePanel>
  );
}

export default HomeRecentLogs;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 2px;
`;

const HeaderFrame = styled.View`
  flex: 1;
  min-width: 0;
`;

const ViewAllButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: 2px;
  padding-top: 4px;
`;

const ViewAllLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.primary};
`;

const ViewAllChevron = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
`;

const LoadingState = styled.View`
  min-height: 120px;
  align-items: center;
  justify-content: center;
`;

const LogList = styled.View`
  gap: 0;
`;

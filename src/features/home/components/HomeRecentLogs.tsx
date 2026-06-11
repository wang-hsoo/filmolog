import { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { ArchiveEmptyText, ArchivePanel } from '../../../components';
import type { UserReviewedMovie } from '../../../lib/supabase/users/movie';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { theme } from '../../../theme';

const HOME_RECENT_LIMIT = 5;
const POSTER_WIDTH = 46;
const POSTER_HEIGHT = 69;

type HomeRecentLogsProps = {
  reviews: UserReviewedMovie[];
  isLoading: boolean;
  onPressReview?: (review: UserReviewedMovie) => void;
};

function formatWatchedDate(date: string | null) {
  if (!date) {
    return null;
  }

  return date.replace(/-/g, '.');
}

function formatRating(rating: number) {
  return rating.toFixed(1);
}

function HomeRecentLogs({
  reviews,
  isLoading,
  onPressReview,
}: HomeRecentLogsProps) {
  const recentReviews = useMemo(
    () => reviews.slice(0, HOME_RECENT_LIMIT),
    [reviews],
  );

  return (
    <ArchivePanel accent compact>
      <SectionHeaderRow>
        <HeaderCopy>
          <SectionOverline>RECENT LOG</SectionOverline>
          <SectionTitle>최근 기록</SectionTitle>
        </HeaderCopy>
      </SectionHeaderRow>

      {isLoading ? (
        <LoadingState>
          <ActivityIndicator color={theme.colors.primary} />
        </LoadingState>
      ) : recentReviews.length === 0 ? (
        <ArchiveEmptyText>
          아직 남긴 기록이 없습니다. 첫 영화를 기록해보세요.
        </ArchiveEmptyText>
      ) : (
        <LogList>
          {recentReviews.map((review, index) => {
            const posterUri = getTmdbPosterUrl(review.posterPath);
            const watchedLabel = formatWatchedDate(review.watchedDate);
            const isLast = index === recentReviews.length - 1;

            return (
              <LogRow
                key={review.reviewId}
                $isLast={isLast}
                onPress={() => onPressReview?.(review)}>
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

                <LogBody>
                  <LogTitle numberOfLines={1}>{review.title}</LogTitle>
                  <LogMetaRow>
                    <RatingWrap>
                      <Icon
                        name="star"
                        size={12}
                        color={theme.colors.primary}
                      />
                      <RatingText>{formatRating(review.rating)}</RatingText>
                    </RatingWrap>
                    {watchedLabel ? (
                      <WatchedDate>{watchedLabel}</WatchedDate>
                    ) : null}
                  </LogMetaRow>
                  {review.content ? (
                    <LogNote numberOfLines={1}>{review.content}</LogNote>
                  ) : null}
                </LogBody>
              </LogRow>
            );
          })}
        </LogList>
      )}
    </ArchivePanel>
  );
}

export default HomeRecentLogs;

const SectionHeaderRow = styled.View`
  margin-bottom: 14px;
`;

const HeaderCopy = styled.View`
  gap: 4px;
`;

const SectionOverline = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 2.4px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 17px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const LoadingState = styled.View`
  min-height: 120px;
  align-items: center;
  justify-content: center;
`;

const LogList = styled.View`
  gap: 0;
`;

const LogRow = styled.Pressable<{ $isLast: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-color: ${({ theme }) => theme.colors.dashbordItemBorder};
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

const LogBody = styled.View`
  flex: 1;
  min-width: 0;
  gap: 4px;
`;

const LogTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 14px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const LogMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
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

const WatchedDate = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const LogNote = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  line-height: 17px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ALL_BADGE_IDS,
  ArchiveEmptyText,
  ArchivePageHeader,
  ArchivePanel,
  ArchiveSectionHeader,
  Container,
} from '../../../components';
import { formatRating } from '../../filmLog/utils/rating';
import ExploreMovieShelf from '../../explore/components/ExploreMovieShelf';
import {
  useAuth,
  useGetUserBadges,
  useGetUserReviewedMovies,
  useGetUserStats,
  useProfileContext,
} from '../../../lib/supabase';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { useGetGenres } from '../../../lib/tmdb';
import type { TmdbMovie } from '../../../lib/tmdb/types';
import { theme } from '../../../theme';

import { useStatsPersonRecommendations } from '../hooks/useStatsPersonRecommendations';

import StatisticsBarChart from './StatisticsBarChart';
import StatisticsGenreRating from './StatisticsGenreRating';
import StatisticsPersonRank from './StatisticsPersonRank';
import StatisticsPieChart from './StatisticsPieChart';
import {
  buildCastRankings,
  buildDecadeCounts,
  buildDirectorRankings,
  buildGenreRatingStats,
  buildGenreSlices,
  buildJournalStats,
  buildMonthlyCounts,
  buildPreferredGenreStats,
  buildRatingBuckets,
  buildYearSummary,
  countReviewsLastDays,
  countReviewsThisMonth,
  getPreferredGenreInsight,
  getRaterInsight,
  getTopRatedReviews,
} from '../utils/reviewStats';

const TAGLINE =
  '모든 기록은 한 편의 영화가 되어 당신이라는 필모그래피로 남습니다.';

const H_PAD = 20;

function StatisticsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const userId = user?.id ?? '';

  const { data: userStats } = useGetUserStats(userId);
  const { data: reviews = [], isLoading: isReviewsLoading } =
    useGetUserReviewedMovies(userId);
  const { data: earnedBadges = [] } = useGetUserBadges(userId);
  const { data: genreData } = useGetGenres();

  const genreNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const genre of genreData?.genres ?? []) {
      map.set(genre.id, genre.name);
    }
    return map;
  }, [genreData?.genres]);

  const { slices: genreSlices, missingGenreReviewCount } = useMemo(
    () => buildGenreSlices(reviews, genreNameById),
    [genreNameById, reviews],
  );

  const { rankings: directorRankings, missingReviewCount: missingDirectorCount } =
    useMemo(() => buildDirectorRankings(reviews), [reviews]);

  const { rankings: castRankings, missingReviewCount: missingCastCount } =
    useMemo(() => buildCastRankings(reviews), [reviews]);

  // const {
  //   topDirector,
  //   topCast,
  //   directorRecommendMovies,
  //   castRecommendMovies,
  //   isDirectorCreditsLoading,
  //   isDirectorCreditsError,
  //   isCastCreditsLoading,
  //   isCastCreditsError,
  // } = useStatsPersonRecommendations(userId);

  // const handlePressRecommendMovie = useCallback(
  //   (movie: TmdbMovie) => {
  //     navigation.navigate('MovieDetail', { tmdbId: movie.id });
  //   },
  //   [navigation],
  // );

  const genreRatingStats = useMemo(
    () => buildGenreRatingStats(reviews, genreNameById),
    [genreNameById, reviews],
  );

  const preferredGenreStats = useMemo(
    () =>
      buildPreferredGenreStats(
        profile?.preferred_genres ?? [],
        reviews,
        genreNameById,
      ),
    [genreNameById, profile?.preferred_genres, reviews],
  );

  const preferredGenreInsight = useMemo(
    () => getPreferredGenreInsight(preferredGenreStats),
    [preferredGenreStats],
  );

  const preferredGenreRankings = useMemo(
    () =>
      preferredGenreStats.map(stat => ({
        personId: stat.genreId,
        name: stat.label,
        count: stat.actualCount,
      })),
    [preferredGenreStats],
  );

  const { items: decadeCounts, missingReleaseYearCount } = useMemo(
    () => buildDecadeCounts(reviews),
    [reviews],
  );

  const monthlyCounts = buildMonthlyCounts(reviews);
  const ratingBuckets = buildRatingBuckets(reviews);
  const topRated = getTopRatedReviews(reviews);
  const journalStats = buildJournalStats(reviews);
  const yearSummary = buildYearSummary(reviews);
  const thisMonthCount = countReviewsThisMonth(reviews);
  const last30DaysCount = countReviewsLastDays(reviews, 30);
  const avgRating = userStats?.avgRating ?? 0;
  const reviewCount = userStats?.reviewCount ?? reviews.length;
  const wishlistCount = userStats?.wishlistCount ?? 0;
  const collectionCount = userStats?.collectionCount ?? 0;
  const raterInsight = getRaterInsight(avgRating, reviewCount);
  const yearDelta = yearSummary.count - yearSummary.previousYearCount;
  const yearDeltaLabel =
    yearDelta > 0
      ? `작년보다 +${yearDelta}`
      : yearDelta < 0
        ? `작년보다 ${yearDelta}`
        : yearSummary.previousYearCount > 0
          ? '작년과 동일'
          : null;

  return (
    <Container isGetter={false}>
      <ArchivePageHeader title="통계" subtitle={TAGLINE} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          {isReviewsLoading ? (
            <LoaderWrap>
              <ActivityIndicator color={theme.colors.primary} size="large" />
            </LoaderWrap>
          ) : (
            <>
              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="SUMMARY"
                  title="나의 필모그래피"
                  subtitle="숫자로 읽는 기록의 윤곽."
                />
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryLabel>총 기록</SummaryLabel>
                    <SummaryValue>{reviewCount}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>평균 평점</SummaryLabel>
                    <SummaryValue>
                      {reviewCount > 0 ? formatRating(avgRating) : '—'}
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>이번 달</SummaryLabel>
                    <SummaryValue>{thisMonthCount}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>최근 30일</SummaryLabel>
                    <SummaryValue>{last30DaysCount}</SummaryValue>
                  </SummaryItem>
                </SummaryGrid>
                <InsightText>{raterInsight}</InsightText>
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline={`${yearSummary.year}`}
                  title="올해의 기록"
                  subtitle="한 해의 필모그래피 결산."
                />
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryLabel>올해 기록</SummaryLabel>
                    <SummaryValue>{yearSummary.count}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>올해 평균</SummaryLabel>
                    <SummaryValue>
                      {yearSummary.count > 0
                        ? formatRating(yearSummary.avgRating)
                        : '—'}
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>위시리스트</SummaryLabel>
                    <SummaryValue>{wishlistCount}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>컬렉션</SummaryLabel>
                    <SummaryValue>{collectionCount}</SummaryValue>
                  </SummaryItem>
                </SummaryGrid>
                {yearDeltaLabel ? (
                  <InsightText>{yearDeltaLabel}</InsightText>
                ) : null}
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="JOURNAL"
                  title="기록 습관"
                  subtitle="평점과 함께 남긴 글의 온도."
                />
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryLabel>글 남긴 기록</SummaryLabel>
                    <SummaryValue>{journalStats.contentRate}%</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>평균 글자 수</SummaryLabel>
                    <SummaryValue>
                      {journalStats.withContentCount > 0
                        ? journalStats.avgContentLength
                        : '—'}
                    </SummaryValue>
                  </SummaryItem>
                </SummaryGrid>
                <InsightText>
                  {journalStats.totalReviews === 0
                    ? '첫 리뷰를 남기면 기록 습관이 집계됩니다.'
                    : `${journalStats.withContentCount}편에 감상을 적었습니다.`}
                </InsightText>
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="TIMELINE"
                  title="월별 기록"
                  subtitle="최근 6개월간 쌓인 장면 수."
                />
                <StatisticsBarChart
                  items={monthlyCounts.map(item => ({
                    label: item.label,
                    value: item.count,
                  }))}
                  emptyMessage="기록이 쌓이면 월별 그래프가 표시됩니다."
                />
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="RATING"
                  title="평점 분포"
                  subtitle="별점별로 남긴 기록의 무게."
                />
                <StatisticsBarChart
                  items={ratingBuckets.map(item => ({
                    label: item.label,
                    value: item.count,
                  }))}
                  emptyMessage="리뷰를 작성하면 평점 분포가 표시됩니다."
                />
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="GENRE"
                  title="장르 분포"
                  subtitle="기록 속에서 드러나는 취향."
                />
                <StatisticsPieChart
                  slices={genreSlices}
                  emptyMessage="장르 정보가 있는 기록이 쌓이면 파이 차트가 표시됩니다."
                />
                {missingGenreReviewCount > 0 ? (
                  <GenreNote>
                    장르 미등록 기록 {missingGenreReviewCount}편은 집계에서
                    제외됩니다.
                  </GenreNote>
                ) : null}
              </ArchivePanel>

              {preferredGenreStats.length > 0 ? (
                <ArchivePanel accent>
                  <ArchiveSectionHeader
                    overline="TASTE"
                    title="선호 장르 vs 실제"
                    subtitle="온보딩에서 고른 취향의 흔적."
                  />
                  <StatisticsPersonRank
                    items={preferredGenreRankings}
                    valueSuffix="회"
                    emptyMessage="선호 장르 기록이 없습니다."
                  />
                  {preferredGenreInsight ? (
                    <InsightText>{preferredGenreInsight}</InsightText>
                  ) : null}
                </ArchivePanel>
              ) : null}

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="GENRE RATING"
                  title="장르별 평균 평점"
                  subtitle="2편 이상 기록한 장르만 표시."
                />
                <StatisticsGenreRating
                  items={genreRatingStats}
                  emptyMessage="장르당 2편 이상 기록이 쌓이면 표시됩니다."
                />
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="ERA"
                  title="개봉 연대별"
                  subtitle="어떤 시대의 영화를 주로 남겼는지."
                />
                <StatisticsBarChart
                  items={decadeCounts.map(item => ({
                    label: item.label.replace('년대', ''),
                    value: item.count,
                  }))}
                  emptyMessage="개봉 연도가 있는 기록이 쌓이면 표시됩니다."
                />
                {missingReleaseYearCount > 0 ? (
                  <GenreNote>
                    개봉 연도 미등록 기록 {missingReleaseYearCount}편은 집계에서
                    제외됩니다.
                  </GenreNote>
                ) : null}
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="DIRECTOR"
                  title="선호 감독"
                  subtitle="기록 속에 자주 등장하는 연출."
                />
                <StatisticsPersonRank
                  items={directorRankings}
                  emptyMessage="감독 정보가 있는 기록이 쌓이면 순위가 표시됩니다."
                />
                {missingDirectorCount > 0 ? (
                  <GenreNote>
                    감독 미등록 기록 {missingDirectorCount}편은 집계에서
                    제외됩니다.
                  </GenreNote>
                ) : null}
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="CAST"
                  title="선호 배우"
                  subtitle="주연 billing top 5 기준."
                />
                <StatisticsPersonRank
                  items={castRankings}
                  emptyMessage="배우 정보가 있는 기록이 쌓이면 순위가 표시됩니다."
                />
                {missingCastCount > 0 ? (
                  <GenreNote>
                    배우 미등록 기록 {missingCastCount}편은 집계에서
                    제외됩니다.
                  </GenreNote>
                ) : null}
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="HIGHLIGHTS"
                  title="높은 평점 Top 3"
                  subtitle="마음에 남은 장면들."
                />
                {topRated.length === 0 ? (
                  <ArchiveEmptyText>
                    아직 기록된 작품이 없습니다.
                  </ArchiveEmptyText>
                ) : (
                  <HighlightList>
                    {topRated.map((review, index) => (
                      <HighlightRow
                        key={review.reviewId}
                        onPress={() =>
                          navigation.navigate('ReviewDetail', {
                            reviewId: review.reviewId,
                          })
                        }
                        accessibilityRole="button">
                        <RankText>{index + 1}</RankText>
                        <PosterWrap>
                          {review.posterPath ? (
                            <Poster
                              source={{
                                uri: getTmdbPosterUrl(review.posterPath),
                              }}
                              resizeMode={FastImage.resizeMode.cover}
                            />
                          ) : (
                            <PosterPlaceholder />
                          )}
                        </PosterWrap>
                        <HighlightInfo>
                          <HighlightTitle numberOfLines={2}>
                            {review.title}
                          </HighlightTitle>
                          <HighlightRating>
                            {formatRating(review.rating)} / 5.0
                          </HighlightRating>
                        </HighlightInfo>
                        <Icon
                          name="chevron-right"
                          size={20}
                          color={theme.colors.primaryMuted}
                        />
                      </HighlightRow>
                    ))}
                  </HighlightList>
                )}
              </ArchivePanel>

              <ArchivePanel>
                <ArchiveSectionHeader
                  overline="BADGES"
                  title="배지 진행"
                  subtitle="필모그래피를 채워가는 업적."
                />
                <BadgeSummaryRow>
                  <BadgeSummaryLabel>획득</BadgeSummaryLabel>
                  <BadgeSummaryValue>
                    {earnedBadges.length} / {ALL_BADGE_IDS.length}
                  </BadgeSummaryValue>
                </BadgeSummaryRow>
                <BadgeLink
                  onPress={() => navigation.navigate('BadgeList')}
                  accessibilityRole="button">
                  <BadgeLinkText>배지 전체 보기</BadgeLinkText>
                  <Icon
                    name="chevron-right"
                    size={18}
                    color={theme.colors.primary}
                  />
                </BadgeLink>
              </ArchivePanel>
            </>
          )}
        </Content>
      </ScrollView>
    </Container>
  );
}

export default StatisticsScreen;

const Content = styled.View`
  padding: 0 ${H_PAD}px 28px;
  gap: 14px;
`;

const LoaderWrap = styled.View`
  align-items: center;
  justify-content: center;
  min-height: 240px;
`;

const SummaryGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

const SummaryItem = styled.View`
  width: 47%;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
  gap: 4px;
`;

const SummaryLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const SummaryValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 22px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const InsightText = styled.Text`
  margin-top: 4px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const GenreNote = styled.Text`
  margin-top: 10px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const HighlightList = styled.View`
  gap: 10px;
`;

const HighlightRow = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const RankText = styled.Text`
  width: 18px;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const PosterWrap = styled.View`
  width: 44px;
  height: 66px;
  border-radius: 4px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
`;

const Poster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const PosterPlaceholder = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const HighlightInfo = styled.View`
  flex: 1;
  gap: 4px;
`;

const HighlightTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  line-height: 19px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const HighlightRating = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const BadgeSummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const BadgeSummaryLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const BadgeSummaryValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const BadgeLink = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 10px;
  padding: 10px;
`;

const BadgeLinkText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
`;

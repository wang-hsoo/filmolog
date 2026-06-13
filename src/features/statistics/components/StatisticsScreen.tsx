import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ALL_BADGE_IDS,
  ArchiveBannerAd,
  ArchiveEmptyText,
  ArchiveNativeAd,
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

const H_PAD = 20;

function StatisticsScreen() {
  const { t } = useTranslation();
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
      ? t('statistics.insights.yearDeltaUp', { delta: yearDelta })
      : yearDelta < 0
        ? t('statistics.insights.yearDeltaDown', { delta: yearDelta })
        : yearSummary.previousYearCount > 0
          ? t('statistics.insights.yearDeltaSame')
          : null;

  return (
    <Container isGetter={false}>
      <ArchivePageHeader
        title={t('statistics.pageTitle')}
        subtitle={t('statistics.tagline')}
      />

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
                  title={t('statistics.sections.filmography.title')}
                  subtitle={t('statistics.sections.filmography.subtitle')}
                />
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.totalLogs')}</SummaryLabel>
                    <SummaryValue>{reviewCount}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.avgRatingShort')}</SummaryLabel>
                    <SummaryValue>
                      {reviewCount > 0 ? formatRating(avgRating) : '—'}
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.thisMonth')}</SummaryLabel>
                    <SummaryValue>{thisMonthCount}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.last30Days')}</SummaryLabel>
                    <SummaryValue>{last30DaysCount}</SummaryValue>
                  </SummaryItem>
                </SummaryGrid>
                <InsightText>{raterInsight}</InsightText>
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline={`${yearSummary.year}`}
                  title={t('statistics.sections.thisYear.title')}
                  subtitle={t('statistics.sections.thisYear.subtitle')}
                />
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.thisYearLogs')}</SummaryLabel>
                    <SummaryValue>{yearSummary.count}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.thisYearAvg')}</SummaryLabel>
                    <SummaryValue>
                      {yearSummary.count > 0
                        ? formatRating(yearSummary.avgRating)
                        : '—'}
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.wishlistCount')}</SummaryLabel>
                    <SummaryValue>{wishlistCount}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.collections')}</SummaryLabel>
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
                  title={t('statistics.sections.journalHabit.title')}
                  subtitle={t('statistics.sections.journalHabit.subtitle')}
                />
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.withJournal')}</SummaryLabel>
                    <SummaryValue>{journalStats.contentRate}%</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>{t('common.stats.avgChars')}</SummaryLabel>
                    <SummaryValue>
                      {journalStats.withContentCount > 0
                        ? journalStats.avgContentLength
                        : '—'}
                    </SummaryValue>
                  </SummaryItem>
                </SummaryGrid>
                <InsightText>
                  {journalStats.totalReviews === 0
                    ? t('statistics.insights.journalEmpty')
                    : t('statistics.insights.journalCount', {
                        count: journalStats.withContentCount,
                      })}
                </InsightText>
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="TIMELINE"
                  title={t('statistics.sections.monthly.title')}
                  subtitle={t('statistics.sections.monthly.subtitle')}
                />
                <StatisticsBarChart
                  items={monthlyCounts.map(item => ({
                    label: item.label,
                    value: item.count,
                  }))}
                  emptyMessage={t('statistics.sections.monthly.empty')}
                />
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="RATING"
                  title={t('statistics.sections.ratingDistribution.title')}
                  subtitle={t('statistics.sections.ratingDistribution.subtitle')}
                />
                <StatisticsBarChart
                  items={ratingBuckets.map(item => ({
                    label: item.label,
                    value: item.count,
                  }))}
                  emptyMessage={t('statistics.sections.ratingDistribution.empty')}
                />
              </ArchivePanel>


              <ArchivePanel>
                <ArchiveNativeAd />
              </ArchivePanel>


              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="GENRE"
                  title={t('statistics.sections.genreDistribution.title')}
                  subtitle={t('statistics.sections.genreDistribution.subtitle')}
                />
                <StatisticsPieChart
                  slices={genreSlices}
                  emptyMessage={t('statistics.sections.genreDistribution.empty')}
                />
                {missingGenreReviewCount > 0 ? (
                  <GenreNote>
                    {t('statistics.sections.genreDistribution.excludedNote', {
                      count: missingGenreReviewCount,
                    })}
                  </GenreNote>
                ) : null}
              </ArchivePanel>

              {preferredGenreStats.length > 0 ? (
                <ArchivePanel accent>
                  <ArchiveSectionHeader
                    overline="TASTE"
                    title={t('statistics.sections.preferredVsActual.title')}
                    subtitle={t('statistics.sections.preferredVsActual.subtitle')}
                  />
                  <StatisticsPersonRank
                    items={preferredGenreRankings}
                    valueSuffix={t('common.units.times')}
                    emptyMessage={t('statistics.sections.preferredVsActual.empty')}
                  />
                  {preferredGenreInsight ? (
                    <InsightText>{preferredGenreInsight}</InsightText>
                  ) : null}
                </ArchivePanel>
              ) : null}

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="GENRE RATING"
                  title={t('statistics.sections.genreRating.title')}
                  subtitle={t('statistics.sections.genreRating.subtitle')}
                />
                <StatisticsGenreRating
                  items={genreRatingStats}
                  emptyMessage={t('statistics.sections.genreRating.empty')}
                />
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="ERA"
                  title={t('statistics.sections.decade.title')}
                  subtitle={t('statistics.sections.decade.subtitle')}
                />
                <StatisticsBarChart
                  items={decadeCounts.map(item => ({
                    label: String(Number.parseInt(item.key, 10)),
                    value: item.count,
                  }))}
                  emptyMessage={t('statistics.sections.decade.empty')}
                />
                {missingReleaseYearCount > 0 ? (
                  <GenreNote>
                    {t('statistics.sections.decade.excludedNote', {
                      count: missingReleaseYearCount,
                    })}
                  </GenreNote>
                ) : null}
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="DIRECTOR"
                  title={t('statistics.sections.directors.title')}
                  subtitle={t('statistics.sections.directors.subtitle')}
                />
                <StatisticsPersonRank
                  items={directorRankings}
                  emptyMessage={t('statistics.sections.directors.empty')}
                />
                {missingDirectorCount > 0 ? (
                  <GenreNote>
                    {t('statistics.sections.directors.excludedNote', {
                      count: missingDirectorCount,
                    })}
                  </GenreNote>
                ) : null}
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="CAST"
                  title={t('statistics.sections.cast.title')}
                  subtitle={t('statistics.sections.cast.subtitle')}
                />
                <StatisticsPersonRank
                  items={castRankings}
                  emptyMessage={t('statistics.sections.cast.empty')}
                />
                {missingCastCount > 0 ? (
                  <GenreNote>
                    {t('statistics.sections.cast.excludedNote', {
                      count: missingCastCount,
                    })}
                  </GenreNote>
                ) : null}
              </ArchivePanel>

              <ArchivePanel accent>
                <ArchiveSectionHeader
                  overline="HIGHLIGHTS"
                  title={t('statistics.sections.highlights.title')}
                  subtitle={t('statistics.sections.highlights.subtitle')}
                />
                {topRated.length === 0 ? (
                  <ArchiveEmptyText>
                    {t('statistics.sections.highlights.empty')}
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
                            {formatRating(review.rating)}{' '}
                            {t('common.rating.scaleSuffix')}
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
                  title={t('statistics.sections.badges.title')}
                  subtitle={t('statistics.sections.badges.subtitle')}
                />
                <BadgeSummaryRow>
                  <BadgeSummaryLabel>{t('common.stats.earned')}</BadgeSummaryLabel>
                  <BadgeSummaryValue>
                    {earnedBadges.length} / {ALL_BADGE_IDS.length}
                  </BadgeSummaryValue>
                </BadgeSummaryRow>
                <BadgeLink
                  onPress={() => navigation.navigate('BadgeList')}
                  accessibilityRole="button">
                  <BadgeLinkText>
                    {t('statistics.sections.badges.viewAll')}
                  </BadgeLinkText>
                  <Icon
                    name="chevron-right"
                    size={18}
                    color={theme.colors.primary}
                  />
                </BadgeLink>
              </ArchivePanel>

              <ArchiveBannerAd />
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

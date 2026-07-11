import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ALL_BADGE_IDS,
  ArchiveEmptyText,
  ArchiveNativeAd,
  ArchivePageHeader,
  ArchivePanel,
  ArchiveSectionHeader,
  Container,
  ScreenLoadingView,
} from '../../../components';
import { formatRating } from '../../filmLog/utils/rating';
import {
  useAuth,
  useGetUserBadges,
  useGetUserReviewedMovies,
  useGetUserStats,
  useProfileContext,
} from '../../../lib/supabase';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { useGetGenres } from '../../../lib/tmdb';
import { theme } from '../../../theme';

import StatisticsBarChart from './StatisticsBarChart';
import StatisticsGenreRating from './StatisticsGenreRating';
import StatisticsLineChart from './StatisticsLineChart';
import StatisticsPersonRank from './StatisticsPersonRank';
import StatisticsPieChart from './StatisticsPieChart';
import StatisticsReactionProfile from './StatisticsReactionProfile';
import StatisticsTabBar, {
  type StatisticsTabKey,
} from './StatisticsTabBar';
import StatisticsYearFilter from './StatisticsYearFilter';
import {
  buildCastRankings,
  buildCumulativeCounts,
  buildDecadeCounts,
  buildDirectorRankings,
  buildGenreRatingStats,
  buildGenreSlices,
  buildJournalStats,
  buildMonthlyTimeline,
  buildPeriodSummary,
  buildPreferredGenreStats,
  buildRatingBuckets,
  buildReactionProfile,
  buildYearlyCounts,
  countReviewsLastDays,
  countReviewsThisMonth,
  filterReviewsByYear,
  getAvailableYears,
  getPreferredGenreInsight,
  getRaterInsight,
  getTimelineInsight,
  getTopRatedReviews,
  type StatsYearFilter,
} from '../utils/reviewStats';

const H_PAD = 20;

function StatisticsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const userId = user?.id ?? '';

  const [activeTab, setActiveTab] = useState<StatisticsTabKey>('overview');
  const [yearFilter, setYearFilter] = useState<StatsYearFilter>('all');

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

  const availableYears = useMemo(() => getAvailableYears(reviews), [reviews]);

  const filteredReviews = useMemo(
    () => filterReviewsByYear(reviews, yearFilter),
    [reviews, yearFilter],
  );

  const periodSummary = useMemo(
    () => buildPeriodSummary(reviews, yearFilter),
    [reviews, yearFilter],
  );

  const monthlyTimeline = useMemo(
    () => buildMonthlyTimeline(filteredReviews, yearFilter, 12),
    [filteredReviews, yearFilter],
  );

  const yearlyCounts = useMemo(() => buildYearlyCounts(reviews), [reviews]);

  const cumulativeCounts = useMemo(
    () => buildCumulativeCounts(filteredReviews),
    [filteredReviews],
  );

  const timelineInsight = useMemo(
    () => getTimelineInsight(monthlyTimeline, yearlyCounts, yearFilter),
    [monthlyTimeline, yearlyCounts, yearFilter],
  );

  const { slices: genreSlices, missingGenreReviewCount } = useMemo(
    () => buildGenreSlices(filteredReviews, genreNameById),
    [filteredReviews, genreNameById],
  );

  const { rankings: directorRankings, missingReviewCount: missingDirectorCount } =
    useMemo(() => buildDirectorRankings(filteredReviews), [filteredReviews]);

  const { rankings: castRankings, missingReviewCount: missingCastCount } =
    useMemo(() => buildCastRankings(filteredReviews), [filteredReviews]);

  const genreRatingStats = useMemo(
    () => buildGenreRatingStats(filteredReviews, genreNameById),
    [filteredReviews, genreNameById],
  );

  const preferredGenreStats = useMemo(
    () =>
      buildPreferredGenreStats(
        profile?.preferred_genres ?? [],
        filteredReviews,
        genreNameById,
      ),
    [filteredReviews, genreNameById, profile?.preferred_genres],
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
    () => buildDecadeCounts(filteredReviews),
    [filteredReviews],
  );

  const ratingBuckets = useMemo(
    () => buildRatingBuckets(filteredReviews),
    [filteredReviews],
  );

  const reactionProfile = useMemo(
    () => buildReactionProfile(filteredReviews),
    [filteredReviews],
  );

  const topRated = useMemo(
    () => getTopRatedReviews(filteredReviews),
    [filteredReviews],
  );

  const journalStats = useMemo(
    () => buildJournalStats(filteredReviews),
    [filteredReviews],
  );

  const thisMonthCount = useMemo(
    () => countReviewsThisMonth(reviews),
    [reviews],
  );

  const last30DaysCount = useMemo(
    () => countReviewsLastDays(reviews, 30),
    [reviews],
  );

  const wishlistCount = userStats?.wishlistCount ?? 0;
  const collectionCount = userStats?.collectionCount ?? 0;
  const raterInsight = getRaterInsight(
    periodSummary.avgRating,
    periodSummary.count,
  );

  const yearDeltaLabel =
    periodSummary.previousCount > 0 || periodSummary.delta !== 0
      ? periodSummary.delta > 0
        ? t('statistics.insights.yearDeltaUp', { delta: periodSummary.delta })
        : periodSummary.delta < 0
          ? t('statistics.insights.yearDeltaDown', {
              delta: periodSummary.delta,
            })
          : t('statistics.insights.yearDeltaSame')
      : null;

  const periodCountLabel =
    yearFilter === 'all'
      ? t('common.stats.totalLogs')
      : t('statistics.yearFilter.yearLogs', { year: yearFilter });

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
              <ScreenLoadingView bare size={88} />
            </LoaderWrap>
          ) : (
            <>
              <StatisticsYearFilter
                years={availableYears}
                value={yearFilter}
                onChange={setYearFilter}
              />

              <StatisticsTabBar value={activeTab} onChange={setActiveTab} />

              {activeTab === 'overview' ? (
                <>
                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="SUMMARY"
                      title={t('statistics.sections.filmography.title')}
                      subtitle={t('statistics.sections.filmography.subtitle')}
                    />
                    <SummaryGrid>
                      <SummaryItem>
                        <SummaryLabel>{periodCountLabel}</SummaryLabel>
                        <SummaryValue>{periodSummary.count}</SummaryValue>
                      </SummaryItem>
                      <SummaryItem>
                        <SummaryLabel>
                          {t('common.stats.avgRatingShort')}
                        </SummaryLabel>
                        <SummaryValue>
                          {periodSummary.count > 0
                            ? formatRating(periodSummary.avgRating)
                            : '—'}
                        </SummaryValue>
                      </SummaryItem>
                      {yearFilter === 'all' ? (
                        <>
                          <SummaryItem>
                            <SummaryLabel>
                              {t('common.stats.thisMonth')}
                            </SummaryLabel>
                            <SummaryValue>{thisMonthCount}</SummaryValue>
                          </SummaryItem>
                          <SummaryItem>
                            <SummaryLabel>
                              {t('common.stats.last30Days')}
                            </SummaryLabel>
                            <SummaryValue>{last30DaysCount}</SummaryValue>
                          </SummaryItem>
                        </>
                      ) : (
                        <>
                          <SummaryItem>
                            <SummaryLabel>
                              {t('common.stats.wishlistCount')}
                            </SummaryLabel>
                            <SummaryValue>{wishlistCount}</SummaryValue>
                          </SummaryItem>
                          <SummaryItem>
                            <SummaryLabel>
                              {t('common.stats.collections')}
                            </SummaryLabel>
                            <SummaryValue>{collectionCount}</SummaryValue>
                          </SummaryItem>
                        </>
                      )}
                    </SummaryGrid>
                    {yearDeltaLabel ? (
                      <InsightText>{yearDeltaLabel}</InsightText>
                    ) : null}
                    <InsightText>{raterInsight}</InsightText>
                  </ArchivePanel>

                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="TIMELINE"
                      title={t('statistics.sections.monthly.title')}
                      subtitle={t('statistics.sections.monthly.subtitle')}
                    />
                    <StatisticsLineChart
                      items={monthlyTimeline.map(item => ({
                        label: item.label,
                        value: item.count,
                      }))}
                      emptyMessage={t('statistics.sections.monthly.empty')}
                    />
                    {timelineInsight ? (
                      <InsightText>{timelineInsight}</InsightText>
                    ) : null}
                  </ArchivePanel>

                  <ArchivePanel>
                    <ArchiveNativeAd />
                  </ArchivePanel>
                </>
              ) : null}

              {activeTab === 'time' ? (
                <>
                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="MONTHLY"
                      title={t('statistics.sections.monthly.title')}
                      subtitle={t('statistics.sections.monthly.subtitle')}
                    />
                    <StatisticsLineChart
                      items={monthlyTimeline.map(item => ({
                        label: item.label,
                        value: item.count,
                      }))}
                      emptyMessage={t('statistics.sections.monthly.empty')}
                    />
                  </ArchivePanel>

                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="YEARLY"
                      title={t('statistics.sections.yearly.title')}
                      subtitle={t('statistics.sections.yearly.subtitle')}
                    />
                    <StatisticsBarChart
                      items={yearlyCounts.map(item => ({
                        label: String(item.year),
                        value: item.count,
                      }))}
                      emptyMessage={t('statistics.sections.yearly.empty')}
                    />
                  </ArchivePanel>

                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="CUMULATIVE"
                      title={t('statistics.sections.cumulative.title')}
                      subtitle={t('statistics.sections.cumulative.subtitle')}
                    />
                    <StatisticsLineChart
                      items={cumulativeCounts.map(item => ({
                        label: item.label,
                        value: item.count,
                      }))}
                      emptyMessage={t('statistics.sections.cumulative.empty')}
                    />
                  </ArchivePanel>

                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="RATING"
                      title={t('statistics.sections.ratingDistribution.title')}
                      subtitle={t(
                        'statistics.sections.ratingDistribution.subtitle',
                      )}
                    />
                    <StatisticsBarChart
                      items={ratingBuckets.map(item => ({
                        label: item.label,
                        value: item.count,
                      }))}
                      emptyMessage={t(
                        'statistics.sections.ratingDistribution.empty',
                      )}
                    />
                  </ArchivePanel>
                  <ArchivePanel>
                    <ArchiveNativeAd />
                  </ArchivePanel>
                </>
              ) : null}

              {activeTab === 'taste' ? (
                <>
                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="GENRE"
                      title={t('statistics.sections.genreDistribution.title')}
                      subtitle={t(
                        'statistics.sections.genreDistribution.subtitle',
                      )}
                    />
                    <StatisticsPieChart
                      slices={genreSlices}
                      emptyMessage={t(
                        'statistics.sections.genreDistribution.empty',
                      )}
                    />
                    {missingGenreReviewCount > 0 ? (
                      <GenreNote>
                        {t('statistics.sections.genreDistribution.excludedNote', {
                          count: missingGenreReviewCount,
                        })}
                      </GenreNote>
                    ) : null}
                  </ArchivePanel>

                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="REACTION"
                      title={t('statistics.sections.reactions.title')}
                      subtitle={t('statistics.sections.reactions.subtitle')}
                    />
                    <StatisticsReactionProfile items={reactionProfile} />
                  </ArchivePanel>

                  <ArchivePanel>
                    <ArchiveNativeAd />
                  </ArchivePanel>

                  {preferredGenreStats.length > 0 ? (
                    <ArchivePanel accent>
                      <ArchiveSectionHeader
                        overline="TASTE"
                        title={t('statistics.sections.preferredVsActual.title')}
                        subtitle={t(
                          'statistics.sections.preferredVsActual.subtitle',
                        )}
                      />
                      <StatisticsPersonRank
                        items={preferredGenreRankings}
                        valueSuffix={t('common.units.times')}
                        emptyMessage={t(
                          'statistics.sections.preferredVsActual.empty',
                        )}
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
                  <ArchivePanel>
                    <ArchiveNativeAd />
                  </ArchivePanel>
                </>
              ) : null}

              {activeTab === 'highlights' ? (
                <>
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

                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="JOURNAL"
                      title={t('statistics.sections.journalHabit.title')}
                      subtitle={t('statistics.sections.journalHabit.subtitle')}
                    />
                    <SummaryGrid>
                      <SummaryItem>
                        <SummaryLabel>
                          {t('common.stats.withJournal')}
                        </SummaryLabel>
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

                  <ArchivePanel>
                    <ArchiveSectionHeader
                      overline="BADGES"
                      title={t('statistics.sections.badges.title')}
                      subtitle={t('statistics.sections.badges.subtitle')}
                    />
                    <BadgeSummaryRow>
                      <BadgeSummaryLabel>
                        {t('common.stats.earned')}
                      </BadgeSummaryLabel>
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

                  <ArchivePanel>
                    <ArchiveNativeAd />
                  </ArchivePanel>
                </>
              ) : null}
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
  color: ${({ theme }) => theme.colors.goldSoft};
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
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const GenreNote = styled.Text`
  margin-top: 10px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.goldSoft};
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
  color: ${({ theme }) => theme.colors.goldSoft};
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
  color: ${({ theme }) => theme.colors.goldSoft};
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

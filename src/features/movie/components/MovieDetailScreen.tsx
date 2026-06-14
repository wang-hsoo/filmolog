import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MciIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  ArchiveNativeAd,
  ArchivePanel,
  ArchiveSectionHeader,
  Header,
} from '../../../components';
import {
  formatRating,
  getStarIconName,
  STAR_VALUES,
} from '../../filmLog/utils/rating';
import {
  useAuth,
  useGetMovieCommunityStats,
  useIsInWishlist,
  useToggleWishlist,
} from '../../../lib/supabase';
import { useMovieDetail } from '../../../lib/tmdb';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import {
  formatReleaseDate,
  formatRuntime,
  getCast,
  getDirectors,
  getGenres,
  getReleaseYear,
} from '../../../lib/tmdb/movieMeta';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import { AppScreen, theme } from '../../../theme';

type MovieDetailRoute = RouteProp<RootStackParamList, 'MovieDetail'>;

const H_PAD = 20;
const POSTER_WIDTH = 108;
const POSTER_HEIGHT = 162;

type CatalogMetaRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

function CatalogMetaRow({ label, value, isLast }: CatalogMetaRowProps) {
  return (
    <>
      <CatalogMetaRowInner>
        <CatalogMetaLabel>{label}</CatalogMetaLabel>
        <CatalogMetaValue numberOfLines={4}>{value}</CatalogMetaValue>
      </CatalogMetaRowInner>
      {!isLast ? <CatalogMetaDivider /> : null}
    </>
  );
}

function MovieDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MovieDetailRoute>();
  const tmdbId = route.params.tmdbId;
  const { user } = useAuth();

  const {
    data: movieDetail,
    isLoading,
    isError,
  } = useMovieDetail(tmdbId);
  const {
    data: communityStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useGetMovieCommunityStats(tmdbId);
  const {
    data: isInWishlist = false,
    isLoading: isWishlistLoading,
  } = useIsInWishlist(user?.id ?? '', tmdbId);
  const { mutateAsync: toggleWishlist, isPending: isWishlistPending } =
    useToggleWishlist();

  const posterUri = getTmdbPosterUrl(movieDetail?.poster_path ?? null);
  const releaseYear = movieDetail
    ? getReleaseYear(movieDetail.release_date)
    : null;
  const subtitleLine = movieDetail
    ? [movieDetail.original_title, releaseYear].filter(Boolean).join(' · ')
    : null;

  const resolveMeta = (value: string | null | undefined) => {
    if (isLoading) {
      return '…';
    }
    if (isError) {
      return '—';
    }
    return value ?? '—';
  };

  const communityRating = communityStats?.avgRating ?? null;
  const reviewCount = communityStats?.reviewCount ?? 0;

  const wishlistMovieInput = useMemo(() => {
    if (!movieDetail) {
      return null;
    }

    const releaseDate = movieDetail.release_date ?? '';
    const releaseYear = releaseDate
      ? Number.parseInt(releaseDate.slice(0, 4), 10)
      : null;

    return {
      title: movieDetail.title,
      posterPath: movieDetail.poster_path,
      genreIds: movieDetail.genres.map(genre => genre.id),
      releaseYear: Number.isFinite(releaseYear) ? releaseYear : null,
      originalTitle: movieDetail.original_title,
    };
  }, [movieDetail]);

  const handleToggleWishlist = useCallback(async () => {
    if (!user?.id || !wishlistMovieInput) {
      return;
    }

    try {
      await toggleWishlist({
        userId: user.id,
        tmdbId,
        isInWishlist,
        movie: wishlistMovieInput,
      });
    } catch {
      archiveAlert(
        t('errors.saveFailed.generic'),
        t('errors.saveFailed.wishlist'),
      );
    }
  }, [isInWishlist, t, tmdbId, toggleWishlist, user?.id, wishlistMovieInput]);

  const handleWriteReview = useCallback(() => {
    navigation.navigate('FilmLog', { tmdbId });
  }, [navigation, tmdbId]);

  const isWishlistBusy = isWishlistLoading || isWishlistPending;

  return (
    <AppScreen style={{ paddingTop: insets.top }}>
      <Header navigation={navigation} subtitle="FILM DETAIL" hideRight />

      {isLoading ? (
        <LoadingState>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadingState>
      ) : isError || !movieDetail ? (
        <ErrorState>
          <ArchiveEmptyText>{t('movie.detail.loadFailed')}</ArchiveEmptyText>
        </ErrorState>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 96,
            }}>
          <Content>
            <ArchivePanel accent>
              <CatalogHeader>
                <ArchiveSectionHeader
                  overline="FILM CATALOG"
                  title={t('movie.detail.catalog.title')}
                  subtitle={t('movie.detail.catalog.subtitle')}
                />
              </CatalogHeader>

              <MovieHeroRow>
                <PosterFrame>
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
                  <PosterCaption>FILM POSTER</PosterCaption>
                </PosterFrame>

                <MovieHeroInfo>
                  <MovieTitle numberOfLines={3}>{movieDetail.title}</MovieTitle>
                  {subtitleLine ? (
                    <MovieSubtitle numberOfLines={2}>{subtitleLine}</MovieSubtitle>
                  ) : null}

                  {movieDetail.genres.length > 0 ? (
                    <GenreRow>
                      {movieDetail.genres.slice(0, 4).map(genre => (
                        <GenreChip key={genre.id}>
                          <GenreChipLabel>{genre.name}</GenreChipLabel>
                        </GenreChip>
                      ))}
                    </GenreRow>
                  ) : null}
                </MovieHeroInfo>
              </MovieHeroRow>

              <CatalogMetaBlock>
                <CatalogMetaRow
                  label={t('common.movieMeta.releaseDate')}
                  value={resolveMeta(formatReleaseDate(movieDetail.release_date))}
                />
                <CatalogMetaRow
                  label={t('common.movieMeta.runtime')}
                  value={resolveMeta(formatRuntime(movieDetail.runtime))}
                />
                <CatalogMetaRow
                  label={t('common.movieMeta.genres')}
                  value={resolveMeta(getGenres(movieDetail))}
                />
                <CatalogMetaRow
                  label={t('common.movieMeta.director')}
                  value={resolveMeta(getDirectors(movieDetail))}
                />
                <CatalogMetaRow
                  label={t('common.movieMeta.castShort')}
                  value={resolveMeta(getCast(movieDetail, 5))}
                  isLast
                />
              </CatalogMetaBlock>
            </ArchivePanel>

            <ArchivePanel accent>
              <ArchiveSectionHeader
                overline="FILMOLOG"
                title={t('movie.detail.community.title')}
                subtitle={t('movie.detail.community.subtitle')}
              />

              {isStatsLoading ? (
                <StatsLoading>
                  <ActivityIndicator color={theme.colors.primary} size="small" />
                </StatsLoading>
              ) : isStatsError ? (
                <ArchiveEmptyText>
                  {t('movie.detail.community.loadFailed')}
                </ArchiveEmptyText>
              ) : reviewCount === 0 ? (
                <StatsEmpty>
                  <MciIcon
                    name="account-group-outline"
                    size={28}
                    color={theme.colors.goldDim}
                  />
                  <ArchiveEmptyText>
                    {t('movie.detail.community.empty')}
                  </ArchiveEmptyText>
                </StatsEmpty>
              ) : (
                <CommunityStatsCard>
                  <RatingStars>
                    {STAR_VALUES.map(star => {
                      const iconName = getStarIconName(
                        star,
                        communityRating ?? 0,
                      );
                      const isActive =
                        communityRating != null && communityRating >= star - 0.5;

                      return (
                        <MciIcon
                          key={star}
                          name={iconName}
                          size={20}
                          color={
                            isActive
                              ? theme.colors.primary
                              : theme.colors.goldDim
                          }
                        />
                      );
                    })}
                  </RatingStars>
                  <RatingDivider />
                  <RatingScore>
                    {communityRating != null
                      ? formatRating(communityRating)
                      : '—'}
                  </RatingScore>
                  <RatingScale>/ 5.0</RatingScale>
                  <ReviewCountRow>
                    <MciIcon
                      name="notebook-outline"
                      size={14}
                      color={theme.colors.dashboardText}
                    />
                    <ReviewCountText>
                      {t('common.units.peopleRated', {
                        count: reviewCount,
                      })}
                    </ReviewCountText>
                  </ReviewCountRow>
                </CommunityStatsCard>
              )}
            </ArchivePanel>

            <ArchivePanel accent>
              <ArchiveSectionHeader
                overline="SYNOPSIS"
                title={t('movie.detail.synopsis.title')}
                subtitle={t('movie.detail.synopsis.subtitle')}
              />

              {movieDetail.overview?.trim() ? (
                <OverviewText>{movieDetail.overview.trim()}</OverviewText>
              ) : (
                <ArchiveEmptyText>{t('movie.detail.synopsis.empty')}</ArchiveEmptyText>
              )}
            </ArchivePanel>
            <ArchivePanel>
                <ArchiveNativeAd />
              </ArchivePanel>
          </Content>
        </ScrollView>

          <ActionBar style={{ paddingBottom: insets.bottom + 12 }}>
            <ActionRow>
              <ReviewButton onPress={handleWriteReview}>
                <MciIcon
                  name="notebook-edit-outline"
                  size={18}
                  color={theme.colors.appBackground}
                />
                <ReviewLabel>{t('movie.detail.writeReview')}</ReviewLabel>
              </ReviewButton>

              <WishlistButton
                onPress={handleToggleWishlist}
                disabled={isWishlistBusy}
                $active={isInWishlist}>
                {isWishlistBusy ? (
                  <ActivityIndicator
                    color={
                      isInWishlist
                        ? theme.colors.appBackground
                        : theme.colors.primary
                    }
                    size="small"
                  />
                ) : (
                  <>
                    <MciIcon
                      name={isInWishlist ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      color={
                        isInWishlist
                          ? theme.colors.appBackground
                          : theme.colors.primary
                      }
                    />
                    <WishlistLabel $active={isInWishlist}>
                      {isInWishlist
                        ? t('common.actions.remove')
                        : t('common.actions.add')}
                    </WishlistLabel>
                  </>
                )}
              </WishlistButton>
            </ActionRow>
          </ActionBar>
        </>
      )}
    </AppScreen>
  );
}

export default MovieDetailScreen;

const LoadingState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ErrorState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0 ${H_PAD}px;
`;

const Content = styled.View`
  padding: 0 ${H_PAD}px;
  gap: 14px;
`;

const CatalogHeader = styled.View`
  margin-bottom: 14px;
`;

const MovieHeroRow = styled.View`
  flex-direction: row;
  gap: 16px;
  margin-bottom: 16px;
`;

const PosterFrame = styled.View`
  align-items: center;
  gap: 8px;
`;

const PosterMat = styled.View`
  width: ${POSTER_WIDTH}px;
  height: ${POSTER_HEIGHT}px;
  padding: 3px;
  border-radius: ${({ theme }) => theme.radii.poster + 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const Poster = styled(FastImage)`
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.poster}px;
`;

const PosterPlaceholder = styled.View`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii.poster}px;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const PosterCaption = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 9px;
  letter-spacing: 1.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const MovieHeroInfo = styled.View`
  flex: 1;
  gap: 8px;
  padding-top: 2px;
`;

const MovieTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 20px;
  line-height: 26px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const MovieSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const GenreRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
`;

const GenreChip = styled.View`
  padding: 4px 8px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const GenreChipLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const CatalogMetaBlock = styled.View`
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.goldLine};
  padding-top: 4px;
`;

const CatalogMetaRowInner = styled.View`
  flex-direction: row;
  gap: 10px;
  padding: 10px 0;
`;

const CatalogMetaLabel = styled.Text`
  width: 52px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const CatalogMetaValue = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const CatalogMetaDivider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;

const StatsLoading = styled.View`
  padding: 20px 0;
  align-items: center;
`;

const StatsEmpty = styled.View`
  align-items: center;
  gap: 10px;
  padding: 12px 0 4px;
`;

const CommunityStatsCard = styled.View`
  align-items: center;
  gap: 8px;
  padding: 8px 0 4px;
`;

const RatingStars = styled.View`
  flex-direction: row;
  gap: 4px;
`;

const RatingDivider = styled.View`
  width: 100%;
  height: 1px;
  margin-top: 4px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;

const RatingScore = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 28px;
  line-height: 32px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const RatingScale = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const ReviewCountRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const ReviewCountText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const OverviewText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: 0.1px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const ActionBar = styled.View`
  position: absolute;
  right: ${H_PAD}px;
  bottom: 0;
  left: ${H_PAD}px;
`;

const ActionRow = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const ReviewButton = styled(Pressable)`
  flex: 1;
  min-height: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.goldSoft};
  background-color: ${({ theme }) => theme.colors.primary};
`;

const ReviewLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 14px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.appBackground};
`;

const WishlistButton = styled(Pressable)<{ $active: boolean }>`
  flex: 1;
  min-height: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.goldSoft : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surfaceRaised};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`;

const WishlistLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 14px;
  letter-spacing: 0.2px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.appBackground : theme.colors.goldSoft};
`;

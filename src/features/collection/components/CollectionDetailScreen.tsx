import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MciIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  COLLECTION_THEMES,
  Header,
} from '../../../components';
import {
  useDeleteCollection,
  useGetCollectionDetail,
  useRemoveCollectionMovie,
  type CollectionMovieItem,
} from '../../../lib/supabase/collection';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import { AppScreen, theme } from '../../../theme';

const H_PAD = 20;
const LIST_POSTER_WIDTH = 56;
const LIST_POSTER_HEIGHT = 84;
const DESTRUCTIVE_COLOR = '#D46B6B';

type DetailRoute = RouteProp<RootStackParamList, 'CollectionDetail'>;

type MovieSortKey = 'latest' | 'ratingDesc';

function getMovieSortOptions(t: ReturnType<typeof useTranslation>['t']) {
  return [
    { key: 'latest' as const, label: t('common.sort.latestAdded') },
    { key: 'ratingDesc' as const, label: t('common.sort.ratingDesc') },
  ];
}

function getTheme(themeId: string) {
  return (
    COLLECTION_THEMES.find(item => item.themeId === themeId) ??
    COLLECTION_THEMES[0]
  );
}

function sortMovies(
  movies: CollectionMovieItem[],
  sortKey: MovieSortKey,
): CollectionMovieItem[] {
  const sorted = [...movies];

  switch (sortKey) {
    case 'latest':
      return sorted.sort(
        (a, b) =>
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      );
    case 'ratingDesc':
      return sorted.sort(
        (a, b) =>
          (b.rating ?? -1) - (a.rating ?? -1) ||
          a.title.localeCompare(b.title, 'ko'),
      );
    default:
      return sorted;
  }
}

function formatRating(rating: number) {
  return rating.toFixed(1);
}

function formatMovieMeta(
  t: ReturnType<typeof useTranslation>['t'],
  movie: CollectionMovieItem,
) {
  const dateSource =
    movie.watchedDate ?? movie.addedAt?.slice(0, 10) ?? null;

  if (!dateSource) {
    return null;
  }

  const formatted = dateSource.replace(/-/g, '.');

  return movie.watchedDate
    ? t('common.movieMeta.watchedPrefix', { date: formatted })
    : t('common.movieMeta.addedPrefix', { date: formatted });
}

function calcAverageRating(movies: CollectionMovieItem[]) {
  const rated = movies.filter(movie => movie.rating != null);

  if (rated.length === 0) {
    return null;
  }

  const sum = rated.reduce((acc, movie) => acc + (movie.rating ?? 0), 0);
  return sum / rated.length;
}

function FilmListRow({
  movie,
  index,
  isLast,
  onPress,
  onPressMore,
}: {
  movie: CollectionMovieItem;
  index: number;
  isLast: boolean;
  onPress: () => void;
  onPressMore: () => void;
}) {
  const { t } = useTranslation();
  const posterUri = getTmdbPosterUrl(movie.posterPath);
  const metaLabel = formatMovieMeta(t, movie);


  return (
    <>
      <FilmListRowPressable
        onPress={onPress}
        disabled={!movie.reviewId}>
        <RowIndex>{String(index + 1).padStart(2, '0')}</RowIndex>

        <RowPosterMat>
          {posterUri ? (
            <RowPoster
              source={{ uri: posterUri }}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <RowPosterPlaceholder />
          )}
        </RowPosterMat>

        <RowInfo>
          <RowTitle numberOfLines={1}>{movie.title}</RowTitle>
          {metaLabel ? (
            <RowMeta numberOfLines={1}>{metaLabel}</RowMeta>
          ) : null}
        </RowInfo>

        <RowRatingCol>
          {movie.rating != null ? (
            <>
              <RowRatingValue>
                <MciIcon
                  name="star"
                  size={12}
                  color={theme.colors.primary}
                />
                <RowRatingText>{formatRating(movie.rating)}</RowRatingText>
              </RowRatingValue>
              <RowRatingLabel>{t('common.movieMeta.myRating')}</RowRatingLabel>
            </>
          ) : (
            <RowRatingLabel>—</RowRatingLabel>
          )}
        </RowRatingCol>

        <RowActions>
          <RowActionButton
            onPress={event => {
              event.stopPropagation();
              onPressMore();
            }}>
            <Icon
              name="more-horizontal"
              size={16}
              color={theme.colors.primaryMuted}
            />
          </RowActionButton>
        </RowActions>
      </FilmListRowPressable>
      {!isLast ? <RowDivider /> : null}
    </>
  );
}

function CollectionDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DetailRoute>();
  const collectionId = route.params.collectionId;
  const [sortKey, setSortKey] = useState<MovieSortKey>('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [actionMovie, setActionMovie] = useState<CollectionMovieItem | null>(
    null,
  );
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);

  const width = useWindowDimensions().width;

  const {
    data: collection,
    isLoading,
    isError,
  } = useGetCollectionDetail(collectionId);
  const { mutateAsync: removeCollectionMovie, isPending: isRemovingMovie } =
    useRemoveCollectionMovie();
  const { mutateAsync: deleteCollection, isPending: isDeletingCollection } =
    useDeleteCollection();

  const isBusy = isRemovingMovie || isDeletingCollection;

  const collectionTheme = useMemo(
    () => getTheme(collection?.theme_id ?? COLLECTION_THEMES[0].themeId),
    [collection?.theme_id],
  );

  const movieSortOptions = useMemo(() => getMovieSortOptions(t), [t]);

  const sortedMovies = useMemo(
    () => sortMovies(collection?.movies ?? [], sortKey),
    [collection?.movies, sortKey],
  );

  const averageRating = useMemo(
    () => calcAverageRating(collection?.movies ?? []),
    [collection?.movies],
  );

  const activeSortLabel =
    movieSortOptions.find(option => option.key === sortKey)?.label ??
    t('common.sort.latestAdded');

  const handleSelectSort = useCallback((key: MovieSortKey) => {
    setSortKey(key);
    setIsSortOpen(false);
  }, []);

  const handleCloseActionModal = useCallback(() => {
    if (!isRemovingMovie) {
      setActionMovie(null);
    }
  }, [isRemovingMovie]);

  const handleViewReview = useCallback(
    (reviewId: string) => {
      setActionMovie(null);
      navigation.navigate('ReviewDetail', { reviewId });
    },
    [navigation],
  );

  const handlePressMovie = useCallback(
    (movie: CollectionMovieItem) => {
      if (movie.reviewId) {
        navigation.navigate('ReviewDetail', { reviewId: movie.reviewId });
        return;
      }

      navigation.navigate('MovieDetail', { tmdbId: movie.tmdbId });
    },
    [navigation],
  );

  const handleDeleteMovie = useCallback(async () => {
    if (!actionMovie) {
      return;
    }

    try {
      await removeCollectionMovie({
        collectionId,
        tmdbId: actionMovie.tmdbId,
      });
      setActionMovie(null);
    } catch {
      archiveAlert(
        t('errors.deleteFailed.generic'),
        t('errors.deleteFailed.collectionMovie'),
      );
    }
  }, [actionMovie, collectionId, removeCollectionMovie, t]);

  const handleDeleteCollection = useCallback(() => {
    if (!collection) {
      return;
    }

    setIsCollectionMenuOpen(false);

    archiveAlert(
      t('dialogs.deleteCollection.title'),
      t('dialogs.deleteCollection.message', { name: collection.name }),
      [
        { text: t('common.actions.cancel'), style: 'cancel' },
        {
          text: t('common.actions.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCollection(collectionId);
              navigation.goBack();
            } catch {
              archiveAlert(
                t('errors.deleteFailed.generic'),
                t('errors.deleteFailed.collection'),
              );
            }
          },
        },
      ],
    );
  }, [collection, collectionId, deleteCollection, navigation, t]);

  return (
    <ScreenRoot style={{ paddingTop: insets.top }}>
      <Header
        subtitle="COLLECTION"
        navigation={navigation}
        onPressRight={() => setIsCollectionMenuOpen(true)}
        rightDisabled={isBusy}
      />

      {isLoading ? (
        <LoadingState>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadingState>
      ) : isError || !collection ? (
        <ErrorState>
          <ArchiveEmptyText>
            {t('collection.detail.loadFailed')}
          </ArchiveEmptyText>
        </ErrorState>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}>
          <ScreenView $height={width * 0.5625}>
            <Image
              source={collectionTheme.bgImage}
              style={{ width: width, height: width * 0.5625 }}
              resizeMode="cover"
            />
          </ScreenView>
          <ContentFrame>
            <JournalPanel>
              <JournalAccent />
              <JournalBody>
                <JournalHeaderRow>
                  <ThemeBadge>
                    <ThemeBadgeImage
                      source={collectionTheme.icon}
                      // resizeMode="contain"
                    />
                  </ThemeBadge>
                  <JournalTitles>
                    <JournalTitle numberOfLines={2}>
                      {collection.name}
                    </JournalTitle>
                    {collection.description ? (
                      <JournalDescription numberOfLines={4}>
                        {collection.description}
                      </JournalDescription>
                    ) : null}
                  </JournalTitles>
                </JournalHeaderRow>

                <StatsRow>
                  <StatBlock>
                    <StatValue>{collection.movies.length}</StatValue>
                    <StatLabel>{t('common.stats.movies')}</StatLabel>
                  </StatBlock>
                  <StatDivider />
                  <StatBlock>
                    <StatValue>
                      {averageRating != null
                        ? formatRating(averageRating)
                        : '—'}
                    </StatValue>
                    <StatLabel>{t('common.stats.avgRatingShort')}</StatLabel>
                  </StatBlock>
                </StatsRow>
              </JournalBody>
            </JournalPanel>

            <FilmsPanel>
              <FilmsPanelHeader>
                <FilmsPanelTitles>
                  <FilmsPanelOverline>FILMS</FilmsPanelOverline>
                  <FilmsPanelTitle>{t('collection.detail.filmsTitle')}</FilmsPanelTitle>
                </FilmsPanelTitles>
                <SortTrigger onPress={() => setIsSortOpen(true)}>
                  <SortLabel>
                    {t('common.sort.sortPrefix', { label: activeSortLabel })}
                  </SortLabel>
                  <Icon
                    name="chevron-down"
                    size={14}
                    color={theme.colors.dashboardText}
                  />
                </SortTrigger>
              </FilmsPanelHeader>

              {sortedMovies.length === 0 ? (
                <FilmsEmptyBody>
                  <ArchiveEmptyText>
                    {t('collection.detail.emptyFilms')}
                  </ArchiveEmptyText>
                </FilmsEmptyBody>
              ) : (
                <FilmList>
                  {sortedMovies.map((movie, index) => (
                    <FilmListRow
                      key={movie.tmdbId}
                      movie={movie}
                      index={index}
                      isLast={index === sortedMovies.length - 1}
                      onPress={() => handlePressMovie(movie)}
                      onPressMore={() => setActionMovie(movie)}
                    />
                  ))}
                </FilmList>
              )}
            </FilmsPanel>
          </ContentFrame>
        </ScrollView>
      )}

      {!isLoading && collection ? (
        <AddMovieFab
          style={{ bottom: insets.bottom + 16 }}
          onPress={() =>
            navigation.navigate('CollectionAddMovies', { collectionId })
          }>
          <Icon name="plus" size={16} color={theme.colors.primary} />
          <AddMovieFabLabel>{t('collection.detail.addFilm')}</AddMovieFabLabel>
        </AddMovieFab>
      ) : null}

      <Modal
        transparent
        visible={isSortOpen}
        animationType="fade"
        onRequestClose={() => setIsSortOpen(false)}>
        <SortModalRoot>
          <SortBackdrop onPress={() => setIsSortOpen(false)} />
          <SortMenu style={{ top: insets.top + 200, right: H_PAD }}>
            {movieSortOptions.map((option, index) => {
              const isActive = option.key === sortKey;
              const isLast = index === movieSortOptions.length - 1;

              return (
                <SortOption
                  key={option.key}
                  $isLast={isLast}
                  onPress={() => handleSelectSort(option.key)}>
                  <SortOptionLabel $active={isActive}>
                    {option.label}
                  </SortOptionLabel>
                  {isActive ? (
                    <MciIcon
                      name="check"
                      size={16}
                      color={theme.colors.primary}
                    />
                  ) : null}
                </SortOption>
              );
            })}
          </SortMenu>
        </SortModalRoot>
      </Modal>

      <Modal
        transparent
        visible={actionMovie != null}
        animationType="fade"
        onRequestClose={handleCloseActionModal}>
        <ActionModalRoot>
          <ActionBackdrop onPress={handleCloseActionModal} />
          <ActionSheet>
            <ActionSheetHeader>
              <ActionSheetTitle numberOfLines={2}>
                {actionMovie?.title}
              </ActionSheetTitle>
            </ActionSheetHeader>

            {actionMovie?.reviewId ? (
              <ActionSheetButton
                disabled={isRemovingMovie}
                onPress={() => handleViewReview(actionMovie.reviewId!)}>
                <MciIcon
                  name="notebook-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <ActionSheetButtonLabel>
                  {t('common.actions.viewLog')}
                </ActionSheetButtonLabel>
              </ActionSheetButton>
            ) : null}

            <ActionSheetButton
              $destructive
              disabled={isRemovingMovie}
              onPress={handleDeleteMovie}>
              {isRemovingMovie ? (
                <ActivityIndicator color={DESTRUCTIVE_COLOR} size="small" />
              ) : (
                <>
                  <MciIcon
                    name="trash-can-outline"
                    size={18}
                    color={DESTRUCTIVE_COLOR}
                  />
                  <ActionSheetButtonLabel $destructive>
                    {t('collection.detail.removeFromCollection')}
                  </ActionSheetButtonLabel>
                </>
              )}
            </ActionSheetButton>

            <ActionSheetButton
              $isLast
              disabled={isRemovingMovie}
              onPress={handleCloseActionModal}>
              <ActionSheetButtonLabel>
                {t('common.actions.cancel')}
              </ActionSheetButtonLabel>
            </ActionSheetButton>
          </ActionSheet>
        </ActionModalRoot>
      </Modal>

      <Modal
        transparent
        visible={isCollectionMenuOpen}
        animationType="fade"
        onRequestClose={() => setIsCollectionMenuOpen(false)}>
        <CollectionMenuRoot>
          <CollectionMenuBackdrop
            onPress={() => setIsCollectionMenuOpen(false)}
          />
          <CollectionMenuSheet style={{ top: insets.top + 56, right: H_PAD }}>
            <CollectionMenuButton
              $isLast
              $destructive
              disabled={isBusy}
              onPress={handleDeleteCollection}>
              {isDeletingCollection ? (
                <ActivityIndicator color={DESTRUCTIVE_COLOR} size="small" />
              ) : (
                <>
                  <MciIcon
                    name="trash-can-outline"
                    size={18}
                    color={DESTRUCTIVE_COLOR}
                  />
                  <CollectionMenuLabel $destructive>
                    {t('collection.detail.deleteCollection')}
                  </CollectionMenuLabel>
                </>
              )}
            </CollectionMenuButton>
          </CollectionMenuSheet>
        </CollectionMenuRoot>
      </Modal>
    </ScreenRoot>
  );
}

export default CollectionDetailScreen;

const ContentFrame = styled.View`
  padding: 0 ${H_PAD}px;
  gap: 14px;
  margin-top: 80px;
`;

const LoadingState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ErrorState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px ${H_PAD}px;
`;

const JournalPanel = styled.View`
  flex-direction: row;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
  overflow: hidden;
  opacity: 0.8;
`;

const JournalAccent = styled.View`
  width: 3px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const JournalBody = styled.View`
  flex: 1;
  padding: 18px 16px 16px;
  gap: 16px;
`;

const JournalHeaderRow = styled.View`
  flex-direction: row;
  gap: 14px;
`;

const ThemeBadge = styled.View`
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.goldLine};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const ThemeBadgeImage = styled(Image)`
  width: 32px;
  height: 32px;
  opacity: 0.9;
`;

const JournalTitles = styled.View`
  flex: 1;
  gap: 8px;
`;

const JournalTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 24px;
  line-height: 32px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.headerTitle};
`;

const JournalDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 21px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const StatsRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-top: 4px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.goldLine};
`;

const StatBlock = styled.View`
  flex: 1;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 22px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const StatLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  letter-spacing: 0.4px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const StatDivider = styled.View`
  width: 1px;
  height: 36px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;

const ScreenRoot = styled(AppScreen)`
  flex: 1;
`;

const SortTrigger = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 2px;
  padding: 4px 0 4px 8px;
`;

const SortLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const FilmsPanel = styled.View`
  border-radius: 14px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
  opacity: 0.92;
  overflow: hidden;
`;

const FilmsPanelHeader = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.goldLine};
`;

const FilmsPanelTitles = styled.View`
  gap: 4px;
`;

const FilmsPanelOverline = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const FilmsPanelTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 17px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const FilmsEmptyBody = styled.View`
  padding: 24px 16px;
`;

const FilmList = styled.View`
  padding: 4px 0 8px;
`;

const FilmListRowPressable = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 14px 12px;
`;

const RowIndex = styled.Text`
  width: 30px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 20px;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colors.primaryMuted};
  text-align: center;
`;

const RowPosterMat = styled.View`
  width: ${LIST_POSTER_WIDTH}px;
  height: ${LIST_POSTER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.radii.poster + 1}px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const RowPoster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const RowPosterPlaceholder = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const RowInfo = styled.View`
  flex: 1;
  min-width: 0;
  gap: 4px;
`;

const RowTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 15px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.headerTitle};
`;

const RowMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const RowRatingCol = styled.View`
  align-items: flex-end;
  gap: 3px;
  min-width: 52px;
`;

const RowRatingValue = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 3px;
`;

const RowRatingText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const RowRatingLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const RowActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
  margin-left: 2px;
`;

const RowActionButton = styled(Pressable)`
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
`;

const RowDivider = styled.View`
  height: 1px;
  margin: 0 16px;
  background-color: ${({ theme }) => theme.colors.dashbordItemBorder};
`;

const AddMovieFab = styled(Pressable)`
  position: absolute;
  right: ${H_PAD}px;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

const SortModalRoot = styled.View`
  flex: 1;
`;

const SortBackdrop = styled(Pressable)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
`;

const SortMenu = styled.View`
  position: absolute;
  min-width: 148px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const SortOption = styled(Pressable)<{ $isLast: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const SortOptionLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.dashboardText};
`;

const ActionModalRoot = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const ActionBackdrop = styled(Pressable)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
`;

const ActionSheet = styled.View`
  margin: 0 ${H_PAD}px;
  border-radius: 14px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const ActionSheetHeader = styled.View`
  padding: 16px 18px 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const ActionSheetTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 16px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.headerTitle};
  text-align: center;
`;

const ActionSheetButton = styled(Pressable)<{
  $destructive?: boolean;
  $isLast?: boolean;
  disabled?: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 52px;
  padding: 0 18px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const ActionSheetButtonLabel = styled.Text<{ $destructive?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 15px;
  letter-spacing: 0.2px;
  color: ${({ theme, $destructive }) =>
    $destructive ? DESTRUCTIVE_COLOR : theme.colors.dashboardText};
`;

const AddMovieFabLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.primary};
`;

const CollectionMenuRoot = styled.View`
  flex: 1;
`;

const CollectionMenuBackdrop = styled(Pressable)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
`;

const CollectionMenuSheet = styled.View`
  position: absolute;
  min-width: 168px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const CollectionMenuButton = styled(Pressable)<{
  $destructive?: boolean;
  $isLast?: boolean;
  disabled?: boolean;
}>`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const CollectionMenuLabel = styled.Text<{ $destructive?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  color: ${({ theme, $destructive }) =>
    $destructive ? DESTRUCTIVE_COLOR : theme.colors.dashboardText};
`;

const ScreenView = styled.View<{ $height: number }>`
  /* flex: 1; */
  width: 100%;
  height: ${({ $height }) => $height}px;
  opacity: 0.5;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

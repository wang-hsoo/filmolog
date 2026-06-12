import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MciIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSectionHeader,
  Header,
} from '../../../components';
import ReviewForm from '../../filmLog/components/ReviewForm';
import {
  parseDateOnly,
  startOfDay,
  toDateOnlyString,
} from '../../filmLog/utils/date';
import {
  formatRating,
  getStarIconName,
  STAR_VALUES,
} from '../../filmLog/utils/rating';
import {
  useDeleteReview,
  useGetReview,
  useUpdateReview,
} from '../../../lib/supabase/reviews';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import {
  formatRuntime,
  formatWatchedDateWithWeekday,
  getCast,
  getDirectors,
  getReleaseYear,
} from '../../../lib/tmdb/movieMeta';
import { useMovieDetail } from '../../../lib/tmdb';
import { AppScreen, theme } from '../../../theme';

type ReviewDetailRoute = RouteProp<RootStackParamList, 'ReviewDetail'>;

const H_PAD = 20;
const POSTER_WIDTH = 108;
const POSTER_HEIGHT = 162;
const DESTRUCTIVE_COLOR = '#D46B6B';
const REVIEW_MAX_LENGTH = 1000;

function formatCatalogRef(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `LOG-${year}${month}${day}`;
}

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
        <CatalogMetaValue numberOfLines={3}>{value}</CatalogMetaValue>
      </CatalogMetaRowInner>
      {!isLast ? <CatalogMetaDivider /> : null}
    </>
  );
}

function ReviewDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ReviewDetailRoute>();
  const reviewId = route.params.reviewId;

  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [watchedDate, setWatchedDate] = useState(() => startOfDay(new Date()));

  const { data: review, isLoading, isError } = useGetReview(reviewId);
  const {
    data: movieDetail,
    isLoading: isMovieLoading,
    isError: isMovieError,
  } = useMovieDetail(review?.tmdbId ?? null);
  const { mutateAsync: updateReview, isPending: isUpdating } =
    useUpdateReview();
  const { mutateAsync: deleteReview, isPending: isDeleting } =
    useDeleteReview();

  const posterUri = getTmdbPosterUrl(
    movieDetail?.poster_path ?? review?.posterPath ?? null,
  );
  const isBusy = isUpdating || isDeleting;
  const displayTitle = movieDetail?.title ?? review?.title ?? '';
  const releaseYear = movieDetail
    ? getReleaseYear(movieDetail.release_date)
    : null;
  const originalTitle = movieDetail?.original_title;
  const subtitleLine = [originalTitle, releaseYear].filter(Boolean).join(' · ');
  const directors = movieDetail ? getDirectors(movieDetail) : null;
  const castLabel = movieDetail ? getCast(movieDetail) : null;
  const runtimeLabel = movieDetail ? formatRuntime(movieDetail.runtime) : null;
  const watchedLabel = formatWatchedDateWithWeekday(review?.watchedDate ?? null);
  const catalogRef = review ? formatCatalogRef(review.createdAt) : null;

  const resolveMovieMeta = (value: string | null | undefined) => {
    if (isMovieLoading) {
      return '…';
    }
    if (isMovieError) {
      return '—';
    }
    return value ?? '—';
  };
  const reviewLength = (isEditing ? content : review?.content ?? '').length;

  const resetEditState = useCallback(() => {
    if (!review) {
      return;
    }

    setRating(review.rating);
    setContent(review.content ?? '');
    setWatchedDate(parseDateOnly(review.watchedDate));
  }, [review]);

  useEffect(() => {
    if (review && isEditing) {
      resetEditState();
    }
  }, [isEditing, resetEditState, review]);

  const handleStartEdit = useCallback(() => {
    setIsMenuOpen(false);
    resetEditState();
    setIsEditing(true);
  }, [resetEditState]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!review) {
      return;
    }

    if (rating === 0) {
      Alert.alert('입력 확인', '평점을 선택해주세요.');
      return;
    }

    try {
      await updateReview({
        reviewId: review.reviewId,
        rating,
        content,
        watchedDate: toDateOnlyString(watchedDate),
      });
      setIsEditing(false);
    } catch {
      Alert.alert(
        '저장 실패',
        '기록을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }, [content, rating, review, updateReview, watchedDate]);

  const handleDelete = useCallback(() => {
    if (!review) {
      return;
    }

    setIsMenuOpen(false);

    Alert.alert(
      '기록 삭제',
      `"${review.title}" 기록을 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(review.reviewId);
              navigation.goBack();
            } catch {
              Alert.alert(
                '삭제 실패',
                '기록을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.',
              );
            }
          },
        },
      ],
    );
  }, [deleteReview, navigation, review]);

  const handleShare = useCallback(async () => {
    if (!review) {
      return;
    }

    setIsMenuOpen(false);

    const message = [
      `🎬 ${displayTitle}`,
      `⭐ ${formatRating(review.rating)}`,
      watchedLabel ? `📅 ${watchedLabel}` : null,
      review.content?.trim() ? `\n${review.content.trim()}` : null,
      '\n— Filmolog',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await Share.share({ message });
    } catch {
      // 사용자가 공유 시트를 닫은 경우 등은 무시
    }
  }, [displayTitle, review, watchedLabel]);

  const handleOpenMovieDetail = useCallback(() => {
    if (!review?.tmdbId) {
      return;
    }

    setIsMenuOpen(false);
    navigation.navigate('MovieDetail', { tmdbId: review.tmdbId });
  }, [navigation, review?.tmdbId]);

  return (
    <AppScreen style={{ paddingTop: insets.top }}>
      <Header
        navigation={navigation}
        subtitle="MY REVIEW"
        onPressRight={() => setIsMenuOpen(true)}
        rightDisabled={isLoading || isError || !review || isEditing}
      />

      {isLoading ? (
        <LoadingState>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadingState>
      ) : isError || !review ? (
        <ErrorState>
          <ArchiveEmptyText>기록을 불러오지 못했습니다.</ArchiveEmptyText>
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
                    title="작품 카드"
                    subtitle="아카이브에 등록된 영화 정보."
                  />
                  {catalogRef ? <CatalogStamp>{catalogRef}</CatalogStamp> : null}
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
                    <Pressable
                      onPress={handleOpenMovieDetail}
                      disabled={!review.tmdbId}>
                      <MovieTitle numberOfLines={3}>{displayTitle}</MovieTitle>
                    </Pressable>
                    {subtitleLine ? (
                      <MovieSubtitle numberOfLines={2}>
                        {subtitleLine}
                      </MovieSubtitle>
                    ) : null}

                    {movieDetail && movieDetail.genres.length > 0 ? (
                      <GenreRow>
                        {movieDetail.genres.slice(0, 4).map(genre => (
                          <GenreChip key={genre.id}>
                            <GenreChipLabel>{genre.name}</GenreChipLabel>
                          </GenreChip>
                        ))}
                      </GenreRow>
                    ) : isMovieLoading ? (
                      <MetaLoading>
                        <ActivityIndicator
                          color={theme.colors.primary}
                          size="small"
                        />
                      </MetaLoading>
                    ) : null}
                  </MovieHeroInfo>
                </MovieHeroRow>

                <CatalogMetaBlock>
                  <CatalogMetaRow
                    label="감독"
                    value={resolveMovieMeta(directors)}
                  />
                  <CatalogMetaRow
                    label="러닝타임"
                    value={resolveMovieMeta(runtimeLabel)}
                  />
                  <CatalogMetaRow
                    label="관람일"
                    value={watchedLabel ?? '—'}
                  />
                  <CatalogMetaRow
                    label="배우"
                    value={resolveMovieMeta(castLabel)}
                    isLast
                  />
                </CatalogMetaBlock>
              </ArchivePanel>

              {isEditing ? (
                <ReviewForm
                  rating={rating}
                  onRatingChange={setRating}
                  content={content}
                  onContentChange={setContent}
                  watchedDate={watchedDate}
                  onWatchedDateChange={setWatchedDate}
                />
              ) : (
                <>
                  <ArchivePanel accent>
                    <ArchiveSectionHeader
                      overline="MY RATING"
                      title="내 평점"
                      subtitle="이 작품에 남긴 점수."
                    />
                    <RatingCard>
                      <RatingStars>
                        {STAR_VALUES.map(star => {
                          const iconName = getStarIconName(star, review.rating);
                          const isActive = review.rating >= star - 0.5;

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
                      <RatingScore>{formatRating(review.rating)}</RatingScore>
                      <RatingScale>/ 5.0</RatingScale>
                    </RatingCard>
                  </ArchivePanel>

                  <ArchivePanel accent>
                    <JournalHeader>
                      <ArchiveSectionHeader
                        overline="JOURNAL"
                        title="감상 기록"
                        subtitle="남긴 메모와 생각."
                      />
                      <JournalCount>
                        {reviewLength} / {REVIEW_MAX_LENGTH}
                      </JournalCount>
                    </JournalHeader>

                    <JournalSheet>
                      {review.content?.trim() ? (
                        <ReviewBody>{review.content.trim()}</ReviewBody>
                      ) : (
                        <JournalEmpty>
                          <MciIcon
                            name="notebook-outline"
                            size={28}
                            color={theme.colors.goldDim}
                          />
                          <ArchiveEmptyText>
                            아직 감상을 적지 않았습니다.
                          </ArchiveEmptyText>
                        </JournalEmpty>
                      )}
                    </JournalSheet>
                  </ArchivePanel>
                </>
              )}
            </Content>
          </ScrollView>

          <ActionBar style={{ paddingBottom: insets.bottom + 12 }}>
            {isEditing ? (
              <ActionRow>
                <ActionButton
                  disabled={isBusy}
                  onPress={handleCancelEdit}
                  $flex>
                  <ActionLabel>취소</ActionLabel>
                </ActionButton>
                <ActionButton
                  disabled={isBusy}
                  onPress={handleSave}
                  $primary
                  $flex>
                  {isUpdating ? (
                    <ActivityIndicator
                      color={theme.colors.appBackground}
                      size="small"
                    />
                  ) : (
                    <ActionLabel $primary>저장</ActionLabel>
                  )}
                </ActionButton>
              </ActionRow>
            ) : (
              <ActionRow>
                <ActionButton disabled={isBusy} onPress={handleStartEdit} $flex>
                  <MciIcon
                    name="pencil-outline"
                    size={17}
                    color={theme.colors.primary}
                  />
                  <ActionLabel>수정</ActionLabel>
                </ActionButton>
                <ActionButton
                  disabled={isBusy}
                  onPress={handleDelete}
                  $flex
                  $destructive>
                  {isDeleting ? (
                    <ActivityIndicator color={DESTRUCTIVE_COLOR} size="small" />
                  ) : (
                    <>
                      <MciIcon
                        name="trash-can-outline"
                        size={17}
                        color={DESTRUCTIVE_COLOR}
                      />
                      <ActionLabel $destructive>삭제</ActionLabel>
                    </>
                  )}
                </ActionButton>
                <ActionButton disabled={isBusy} onPress={handleShare} $flex>
                  <MciIcon
                    name="share-variant-outline"
                    size={17}
                    color={theme.colors.primary}
                  />
                  <ActionLabel>공유</ActionLabel>
                </ActionButton>
              </ActionRow>
            )}
          </ActionBar>

          <Modal
            transparent
            visible={isMenuOpen}
            animationType="fade"
            onRequestClose={() => setIsMenuOpen(false)}>
            <MenuModalRoot>
              <MenuBackdrop onPress={() => setIsMenuOpen(false)} />
              <MenuSheet style={{ top: insets.top + 56, right: H_PAD }}>
                <MenuButton onPress={handleOpenMovieDetail}>
                  <MciIcon
                    name="movie-open-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <MenuLabel>작품 정보</MenuLabel>
                </MenuButton>
                <MenuButton onPress={handleStartEdit}>
                  <MciIcon
                    name="pencil-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <MenuLabel>수정</MenuLabel>
                </MenuButton>
                <MenuButton onPress={handleShare}>
                  <MciIcon
                    name="share-variant-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <MenuLabel>공유</MenuLabel>
                </MenuButton>
                <MenuButton $isLast $destructive onPress={handleDelete}>
                  <MciIcon
                    name="trash-can-outline"
                    size={18}
                    color={DESTRUCTIVE_COLOR}
                  />
                  <MenuLabel $destructive>삭제</MenuLabel>
                </MenuButton>
              </MenuSheet>
            </MenuModalRoot>
          </Modal>
        </>
      )}
    </AppScreen>
  );
}

export default ReviewDetailScreen;

const Content = styled.View`
  padding: 14px ${H_PAD}px 0;
  gap: 14px;
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

const CatalogHeader = styled.View`
  position: relative;
  margin-bottom: 4px;
`;

const CatalogStamp = styled.Text`
  position: absolute;
  top: 2px;
  right: 0;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 1.2px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const MovieHeroRow = styled.View`
  flex-direction: row;
  gap: 16px;
  margin-bottom: 14px;
`;

const PosterFrame = styled.View`
  align-items: center;
  gap: 6px;
`;

const PosterMat = styled.View`
  width: ${POSTER_WIDTH + 8}px;
  height: ${POSTER_HEIGHT + 8}px;
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.poster + 3}px;
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

const PosterCaption = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 8px;
  letter-spacing: 1.6px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const MovieHeroInfo = styled.View`
  flex: 1;
  min-width: 0;
  gap: 8px;
  padding-top: 2px;
`;

const MovieTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 21px;
  line-height: 29px;
  letter-spacing: 0.4px;
  color: ${({ theme }) => theme.colors.headerTitle};
`;

const MovieSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const GenreRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
`;

const GenreChip = styled.View`
  padding: 4px 9px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.goldLine};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const GenreChipLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 0.4px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const MetaLoading = styled.View`
  padding-top: 4px;
`;

const CatalogMetaBlock = styled.View`
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.goldLine};
  background-color: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

const CatalogMetaRowInner = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 14px;
`;

const CatalogMetaLabel = styled.Text`
  width: 58px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  line-height: 17px;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const CatalogMetaValue = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 12px;
  line-height: 17px;
  text-align: right;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const CatalogMetaDivider = styled.View`
  height: 1px;
  margin: 0 12px;
  background-color: ${({ theme }) => theme.colors.dashbordItemBorder};
`;

const RatingCard = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.goldLine};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const RatingStars = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 3px;
`;

const RatingDivider = styled.View`
  width: 1px;
  height: 22px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;

const RatingScore = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 22px;
  letter-spacing: 0.4px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const RatingScale = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const JournalHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const JournalCount = styled.Text`
  margin-top: 18px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 0.4px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const JournalSheet = styled.View`
  min-height: 200px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.goldLine};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const JournalEmpty = styled.View`
  flex: 1;
  min-height: 168px;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ReviewBody = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 15px;
  line-height: 26px;
  letter-spacing: 0.25px;
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
  gap: 8px;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radii.panel + 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground}ee;
`;

const ActionButton = styled(Pressable)<{
  $flex?: boolean;
  $primary?: boolean;
  $destructive?: boolean;
  disabled?: boolean;
}>`
  flex: ${({ $flex }) => ($flex ? 1 : 0)};
  min-height: 46px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme, $primary, $destructive }) =>
    $primary
      ? theme.colors.goldSoft
      : $destructive
        ? 'rgba(212, 107, 107, 0.35)'
        : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $primary, $destructive }) =>
    $primary
      ? theme.colors.primary
      : $destructive
        ? 'rgba(212, 107, 107, 0.08)'
        : theme.colors.surfaceRaised};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const ActionLabel = styled.Text<{ $primary?: boolean; $destructive?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 13px;
  letter-spacing: 0.2px;
  color: ${({ theme, $primary, $destructive }) =>
    $primary
      ? theme.colors.appBackground
      : $destructive
        ? DESTRUCTIVE_COLOR
        : theme.colors.goldSoft};
`;

const MenuModalRoot = styled.View`
  flex: 1;
`;

const MenuBackdrop = styled(Pressable)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
`;

const MenuSheet = styled.View`
  position: absolute;
  min-width: 148px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const MenuButton = styled(Pressable)<{
  $destructive?: boolean;
  $isLast?: boolean;
}>`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const MenuLabel = styled.Text<{ $destructive?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  color: ${({ theme, $destructive }) =>
    $destructive ? DESTRUCTIVE_COLOR : theme.colors.goldSoft};
`;

import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { formatRuntimeLocalized } from '../../../i18n/labels';
import type { TmdbMovieDetail } from '../../../lib/tmdb/types';

const POSTER_WIDTH = 96;
const POSTER_ASPECT_RATIO = 165 / 110;
const POSTER_MAT = 3;

type MovieInfoCardProps = {
  detail: TmdbMovieDetail;
};

function formatReleaseDate(value: string) {
  if (!value) {
    return '-';
  }

  const [year, month, day] = value.split('-');
  if (!year) {
    return '-';
  }

  if (month && day) {
    return `${year}.${month}.${day}`;
  }

  return year;
}

function getDirectors(detail: TmdbMovieDetail) {
  const directors = detail.credits.crew
    .filter(member => member.job === 'Director')
    .map(member => member.name);

  return directors.length > 0 ? directors.join(', ') : '-';
}

function getCast(detail: TmdbMovieDetail, limit = 4) {
  const cast = [...detail.credits.cast]
    .sort((a, b) => a.order - b.order)
    .slice(0, limit)
    .map(member => member.name);

  return cast.length > 0 ? cast.join(', ') : '-';
}

function getGenres(detail: TmdbMovieDetail) {
  return detail.genres.length > 0
    ? detail.genres.map(genre => genre.name).join(', ')
    : '-';
}

function MovieInfoCard({ detail }: MovieInfoCardProps) {
  const { t } = useTranslation();
  const posterUri = getTmdbPosterUrl(detail.poster_path);
  const posterHeight = POSTER_WIDTH * POSTER_ASPECT_RATIO;
  const frameWidth = POSTER_WIDTH + POSTER_MAT * 2;
  const frameHeight = posterHeight + POSTER_MAT * 2;

  return (
    <Card>
      <PosterMat $width={frameWidth} $height={frameHeight}>
        <PosterFrame $width={POSTER_WIDTH} $height={posterHeight}>
          {posterUri ? (
            <Poster
              source={{ uri: posterUri }}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <PosterPlaceholder />
          )}
        </PosterFrame>
      </PosterMat>

      <InfoColumn>
        <MovieTitle numberOfLines={3}>{detail.title}</MovieTitle>

        <MetaList>
          <MetaRow>
            <MetaLabel>{t('common.movieMeta.releaseDate')}</MetaLabel>
            <MetaValue>{formatReleaseDate(detail.release_date)}</MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaLabel>{t('common.movieMeta.runtime')}</MetaLabel>
            <MetaValue>
              {formatRuntimeLocalized(t, detail.runtime) ?? '-'}
            </MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaLabel>{t('common.movieMeta.genre')}</MetaLabel>
            <MetaValue numberOfLines={2}>{getGenres(detail)}</MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaLabel>{t('common.movieMeta.director')}</MetaLabel>
            <MetaValue numberOfLines={2}>{getDirectors(detail)}</MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaLabel>{t('common.movieMeta.castShort')}</MetaLabel>
            <MetaValue numberOfLines={3}>{getCast(detail)}</MetaValue>
          </MetaRow>
        </MetaList>
      </InfoColumn>
    </Card>
  );
}

export default MovieInfoCard;

const Card = styled.View`
  flex-direction: row;
  gap: 14px;
  margin-bottom: 12px;
`;

const PosterMat = styled.View<{ $width: number; $height: number }>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  padding: ${POSTER_MAT}px;
  border-radius: ${({ theme }) => theme.radii.poster + 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const PosterFrame = styled.View<{ $width: number; $height: number }>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  border-radius: ${({ theme }) => theme.radii.poster}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const Poster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const PosterPlaceholder = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const InfoColumn = styled.View`
  flex: 1;
  gap: 10px;
`;

const MovieTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const MetaList = styled.View`
  gap: 6px;
`;

const MetaRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const MetaLabel = styled.Text`
  width: 52px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const MetaValue = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

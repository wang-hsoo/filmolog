import React, { useMemo } from 'react';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components/native';

import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import type { TmdbMovie } from '../../../lib/tmdb/types';

const DEFAULT_POSTER_WIDTH = 110;
const POSTER_ASPECT_RATIO = 165 / 110;
const TITLE_GAP = 10;
const TITLE_HEIGHT = 38;
const POSTER_MAT = 3;

export const MOVIE_ROW_ITEM_HEIGHT =
  DEFAULT_POSTER_WIDTH * POSTER_ASPECT_RATIO +
  POSTER_MAT * 2 +
  TITLE_GAP +
  TITLE_HEIGHT;

type MovieRowItemProps = {
  movie: TmdbMovie;
  width?: number;
  variant?: 'row' | 'grid';
};

function MovieRowItem({
  movie,
  width = DEFAULT_POSTER_WIDTH,
  variant = 'row',
}: MovieRowItemProps) {
  const posterUri = useMemo(
    () => getTmdbPosterUrl(movie.poster_path),
    [movie.poster_path],
  );
  const posterHeight = width * POSTER_ASPECT_RATIO;
  const frameSize = width + POSTER_MAT * 2;
  const frameHeight = posterHeight + POSTER_MAT * 2;

  return (
    <Container $width={width} $variant={variant}>
      <PosterMat $width={frameSize} $height={frameHeight}>
        <PosterFrame $width={width} $height={posterHeight}>
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
      <Title numberOfLines={2} ellipsizeMode="tail">
        {movie.title}
      </Title>
    </Container>
  );
}

export default React.memo(MovieRowItem);

const Container = styled.View<{ $width: number; $variant: 'row' | 'grid' }>`
  width: ${({ $width }) => $width + POSTER_MAT * 2}px;
  margin-right: ${({ $variant }) => ($variant === 'row' ? '10px' : '0')};
  margin-bottom: ${({ $variant }) => ($variant === 'grid' ? '18px' : '0')};
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

const Title = styled.Text.attrs(({ theme }) => ({
  maxFontSizeMultiplier: theme.accessibility.maxFontSizeMultiplier,
}))`
  margin-top: ${TITLE_GAP}px;
  width: 100%;
  min-height: ${TITLE_HEIGHT}px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

export const POSTER_HEIGHT = DEFAULT_POSTER_WIDTH * POSTER_ASPECT_RATIO;
export const POSTER_WIDTH = DEFAULT_POSTER_WIDTH;

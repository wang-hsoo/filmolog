import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import type { TmdbMovie } from '../../../lib/tmdb/types';
import { theme } from '../../../theme';

const DEFAULT_POSTER_WIDTH = 110;
const POSTER_ASPECT_RATIO = 165 / 110;
const TITLE_GAP = 10;
const TITLE_HEIGHT = 38;
const RATING_GAP = 4;
const RATING_HEIGHT = 16;
const POSTER_MAT = 3;

const BASE_MOVIE_ROW_ITEM_HEIGHT =
  DEFAULT_POSTER_WIDTH * POSTER_ASPECT_RATIO +
  POSTER_MAT * 2 +
  TITLE_GAP +
  TITLE_HEIGHT;

export const MOVIE_ROW_ITEM_HEIGHT = BASE_MOVIE_ROW_ITEM_HEIGHT;

export function getMovieRowItemHeight(showRating = false) {
  return (
    BASE_MOVIE_ROW_ITEM_HEIGHT +
    (showRating ? RATING_GAP + RATING_HEIGHT : 0)
  );
}

type MovieRowItemProps = {
  movie: TmdbMovie;
  width?: number;
  variant?: 'row' | 'grid';
  showRating?: boolean;
  onPress?: () => void;
};

function MovieRowItem({
  movie,
  width = DEFAULT_POSTER_WIDTH,
  variant = 'row',
  showRating = false,
  onPress,
}: MovieRowItemProps) {
  const posterUri = useMemo(
    () => getTmdbPosterUrl(movie.poster_path),
    [movie.poster_path],
  );
  const posterHeight = width * POSTER_ASPECT_RATIO;
  const frameSize = width + POSTER_MAT * 2;
  const frameHeight = posterHeight + POSTER_MAT * 2;

  const content = (
    <>
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
      <Title
        $compact={showRating}
        numberOfLines={showRating ? 1 : 2}
        ellipsizeMode="tail">
        {movie.title}
      </Title>
      {showRating ? (
        <RatingRow>
          <Icon name="star" size={11} color={theme.colors.primary} />
          <RatingText>{movie.vote_average.toFixed(1)}</RatingText>
        </RatingRow>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <Container $width={width} $variant={variant}>
          {content}
        </Container>
      </Pressable>
    );
  }

  return (
    <Container $width={width} $variant={variant}>
      {content}
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
}))<{ $compact?: boolean }>`
  margin-top: ${TITLE_GAP}px;
  width: 100%;
  min-height: ${({ $compact }) => ($compact ? 18 : TITLE_HEIGHT)}px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const RatingRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 3px;
  margin-top: ${RATING_GAP}px;
  min-height: ${RATING_HEIGHT}px;
`;

const RatingText = styled.Text.attrs(({ theme }) => ({
  maxFontSizeMultiplier: theme.accessibility.maxFontSizeMultiplier,
}))`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 11px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

export const POSTER_HEIGHT = DEFAULT_POSTER_WIDTH * POSTER_ASPECT_RATIO;
export const POSTER_WIDTH = DEFAULT_POSTER_WIDTH;

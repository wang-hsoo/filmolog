import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import styled from 'styled-components/native';

import { AD_UNITS } from '../../lib/ads';
import {
  getMovieRowItemHeight,
  POSTER_HEIGHT,
  POSTER_WIDTH,
} from '../ui/movieRowItem';
import { theme } from '../../theme';

const POSTER_MAT = 3;
const POSTER_ASPECT_RATIO = POSTER_HEIGHT / POSTER_WIDTH;
const TITLE_GAP = 10;
const TITLE_HEIGHT = 38;
const RATING_GAP = 4;
const RATING_HEIGHT = 16;

type MoviePosterNativeAdProps = {
  width?: number;
  variant?: 'row' | 'grid';
  showRating?: boolean;
};

function MoviePosterNativeAd({
  width = POSTER_WIDTH,
  variant = 'row',
  showRating = false,
}: MoviePosterNativeAdProps) {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [failed, setFailed] = useState(false);

  const posterHeight = width * POSTER_ASPECT_RATIO;
  const frameSize = width + POSTER_MAT * 2;
  const frameHeight = posterHeight + POSTER_MAT * 2;
  const minHeight = getMovieRowItemHeight(showRating);

  useEffect(() => {
    let cancelled = false;
    let ad: NativeAd | null = null;

    NativeAd.createForAdRequest(AD_UNITS.NATIVE)
      .then(loadedAd => {
        if (cancelled) {
          loadedAd.destroy();
          return;
        }

        ad = loadedAd;
        setNativeAd(loadedAd);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
      ad?.destroy();
    };
  }, []);

  if (failed) {
    return null;
  }

  if (!nativeAd) {
    return (
      <Container $width={width} $variant={variant} $minHeight={minHeight}>
        <PosterMat $width={frameSize} $height={frameHeight}>
          <PosterFrame $width={width} $height={posterHeight}>
            <LoadingWrap>
              <ActivityIndicator color={theme.colors.primary} size="small" />
            </LoadingWrap>
          </PosterFrame>
        </PosterMat>
        <TitlePlaceholder />
        {showRating ? <RatingPlaceholder /> : null}
      </Container>
    );
  }

  return (
    <Container $width={width} $variant={variant} $minHeight={minHeight}>
      <NativeAdView nativeAd={nativeAd}>
        <PosterMat $width={frameSize} $height={frameHeight}>
          <PosterFrame $width={width} $height={posterHeight}>
            <NativeMediaView
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
            />
            <AdBadge>
              <AdBadgeText>Ad</AdBadgeText>
            </AdBadge>
          </PosterFrame>
        </PosterMat>

        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <Title
            $compact={showRating}
            numberOfLines={showRating ? 1 : 2}
            ellipsizeMode="tail">
            {nativeAd.headline}
          </Title>
        </NativeAsset>

        {showRating ? <RatingSpacer /> : null}
      </NativeAdView>
    </Container>
  );
}

export default MoviePosterNativeAd;

const Container = styled.View<{
  $width: number;
  $variant: 'row' | 'grid';
  $minHeight: number;
}>`
  width: ${({ $width }) => $width + POSTER_MAT * 2}px;
  min-height: ${({ $minHeight }) => $minHeight}px;
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

const LoadingWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const AdBadge = styled.View`
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 5px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.72);
  border-width: 1px;
  border-color: ${theme.colors.goldLine};
`;

const AdBadgeText = styled.Text`
  font-family: ${theme.fonts.bodyLight};
  font-size: 8px;
  letter-spacing: 0.6px;
  color: ${theme.colors.goldBright};
`;

const Title = styled.Text.attrs(({ theme: appTheme }) => ({
  maxFontSizeMultiplier: appTheme.accessibility.maxFontSizeMultiplier,
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

const TitlePlaceholder = styled.View`
  margin-top: ${TITLE_GAP}px;
  width: 72%;
  height: 12px;
  border-radius: 2px;
  background-color: ${theme.colors.surfaceRaised};
`;

const RatingSpacer = styled.View`
  margin-top: ${RATING_GAP}px;
  min-height: ${RATING_HEIGHT}px;
`;

const RatingPlaceholder = styled.View`
  margin-top: ${RATING_GAP}px;
  width: 36%;
  height: 10px;
  border-radius: 2px;
  background-color: ${theme.colors.surfaceRaised};
`;

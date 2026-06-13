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

const LIST_POSTER_WIDTH = 56;
const LIST_POSTER_HEIGHT = 84;

type MoviePosterNativeAdProps = {
  width?: number;
  variant?: 'row' | 'grid' | 'listRow';
  showRating?: boolean;
};

function usePosterNativeAd() {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [failed, setFailed] = useState(false);

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

  return { nativeAd, failed };
}

function MoviePosterNativeAd({
  width = POSTER_WIDTH,
  variant = 'row',
  showRating = false,
}: MoviePosterNativeAdProps) {
  const { nativeAd, failed } = usePosterNativeAd();

  if (failed) {
    return null;
  }

  if (variant === 'listRow') {
    return (
      <ListRowNativeAd nativeAd={nativeAd} />
    );
  }

  const posterHeight = width * POSTER_ASPECT_RATIO;
  const frameSize = width + POSTER_MAT * 2;
  const frameHeight = posterHeight + POSTER_MAT * 2;
  const minHeight = getMovieRowItemHeight(showRating);

  if (!nativeAd) {
    return (
      <ShelfContainer $width={width} $variant={variant} $minHeight={minHeight}>
        <ShelfPosterMat $width={frameSize} $height={frameHeight}>
          <ShelfPosterFrame $width={width} $height={posterHeight}>
            <LoadingWrap>
              <ActivityIndicator color={theme.colors.primary} size="small" />
            </LoadingWrap>
          </ShelfPosterFrame>
        </ShelfPosterMat>
        <ShelfTitlePlaceholder />
        {showRating ? <ShelfRatingPlaceholder /> : null}
      </ShelfContainer>
    );
  }

  return (
    <ShelfContainer $width={width} $variant={variant} $minHeight={minHeight}>
      <NativeAdView nativeAd={nativeAd}>
        <ShelfPosterMat $width={frameSize} $height={frameHeight}>
          <ShelfPosterFrame $width={width} $height={posterHeight}>
            <NativeMediaView
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
            />
            <AdBadge>
              <AdBadgeText>Ad</AdBadgeText>
            </AdBadge>
          </ShelfPosterFrame>
        </ShelfPosterMat>

        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <ShelfTitle
            $compact={showRating}
            numberOfLines={showRating ? 1 : 2}
            ellipsizeMode="tail">
            {nativeAd.headline}
          </ShelfTitle>
        </NativeAsset>

        {showRating ? <ShelfRatingSpacer /> : null}
      </NativeAdView>
    </ShelfContainer>
  );
}

function ListRowNativeAd({ nativeAd }: { nativeAd: NativeAd | null }) {
  if (!nativeAd) {
    return (
      <ListRowRoot>
        <ListRowPosterMat>
          <LoadingWrap>
            <ActivityIndicator color={theme.colors.primary} size="small" />
          </LoadingWrap>
        </ListRowPosterMat>
        <ListRowInfo>
          <ListRowTitlePlaceholder />
          <ListRowMetaPlaceholder />
        </ListRowInfo>
        <ListRowAdCol>
          <ListRowAdLabelPlaceholder />
        </ListRowAdCol>
        <ListRowTrailing />
      </ListRowRoot>
    );
  }

  const metaLabel = nativeAd.body ?? nativeAd.advertiser ?? 'Sponsored';

  return (
    <NativeAdView nativeAd={nativeAd}>
      <ListRowRoot>
        <ListRowPosterMat>
          <NativeMediaView
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
          />
          <AdBadge>
            <AdBadgeText>Ad</AdBadgeText>
          </AdBadge>
        </ListRowPosterMat>

        <ListRowInfo>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <ListRowTitle numberOfLines={2}>{nativeAd.headline}</ListRowTitle>
          </NativeAsset>
          <ListRowMeta numberOfLines={1}>{metaLabel}</ListRowMeta>
        </ListRowInfo>

        <ListRowAdCol>
          <ListRowAdTag>Sponsored</ListRowAdTag>
        </ListRowAdCol>

        <ListRowTrailing />
      </ListRowRoot>
    </NativeAdView>
  );
}

export default MoviePosterNativeAd;

const ShelfContainer = styled.View<{
  $width: number;
  $variant: 'row' | 'grid';
  $minHeight: number;
}>`
  width: ${({ $width }) => $width + POSTER_MAT * 2}px;
  min-height: ${({ $minHeight }) => $minHeight}px;
  margin-right: ${({ $variant }) => ($variant === 'row' ? '10px' : '0')};
  margin-bottom: ${({ $variant }) => ($variant === 'grid' ? '18px' : '0')};
`;

const ShelfPosterMat = styled.View<{ $width: number; $height: number }>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  padding: ${POSTER_MAT}px;
  border-radius: ${({ theme }) => theme.radii.poster + 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const ShelfPosterFrame = styled.View<{ $width: number; $height: number }>`
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

const ShelfTitle = styled.Text.attrs(({ theme: appTheme }) => ({
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

const ShelfTitlePlaceholder = styled.View`
  margin-top: ${TITLE_GAP}px;
  width: 72%;
  height: 12px;
  border-radius: 2px;
  background-color: ${theme.colors.surfaceRaised};
`;

const ShelfRatingSpacer = styled.View`
  margin-top: ${RATING_GAP}px;
  min-height: ${RATING_HEIGHT}px;
`;

const ShelfRatingPlaceholder = styled.View`
  margin-top: ${RATING_GAP}px;
  width: 36%;
  height: 10px;
  border-radius: 2px;
  background-color: ${theme.colors.surfaceRaised};
`;

const ListRowRoot = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 14px 12px;
`;

const ListRowPosterMat = styled.View`
  position: relative;
  width: ${LIST_POSTER_WIDTH}px;
  height: ${LIST_POSTER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.radii.poster + 1}px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const ListRowInfo = styled.View`
  flex: 1;
  min-width: 0;
  gap: 4px;
`;

const ListRowTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 15px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.headerTitle};
`;

const ListRowMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const ListRowTitlePlaceholder = styled.View`
  width: 72%;
  height: 14px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

const ListRowMetaPlaceholder = styled.View`
  width: 40%;
  height: 11px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

const ListRowAdCol = styled.View`
  align-items: flex-end;
  justify-content: center;
  min-width: 52px;
`;

const ListRowAdTag = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const ListRowAdLabelPlaceholder = styled.View`
  width: 48px;
  height: 10px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

const ListRowTrailing = styled.View`
  width: 28px;
`;

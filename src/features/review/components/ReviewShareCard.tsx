import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';

import { formatRating } from '../../filmLog/utils/rating';
import { theme } from '../../../theme';

/** 9:16 — 인스타/카톡 스토리·피드 미리보기에 맞춤 */
export const SHARE_CARD_WIDTH = 360;
export const SHARE_CARD_HEIGHT = 640;

export const SHARE_CARD_EXPORT_WIDTH = 1080;
export const SHARE_CARD_EXPORT_HEIGHT = 1920;

export type ReviewShareCardProps = {
  title: string;
  subtitle?: string;
  posterUri: string | null;
  rating: number;
  content: string | null;
  watchedLabel: string | null;
  catalogRef: string | null;
  onPosterLoad?: () => void;
};

function trimShareQuote(text: string | null, maxLength = 160) {
  const trimmed = text?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

const ReviewShareCard = forwardRef<View, ReviewShareCardProps>(
  (
    {
      title,
      subtitle,
      posterUri,
      rating,
      content,
      watchedLabel,
      catalogRef,
      onPosterLoad,
    },
    ref,
  ) => {
    const quote = useMemo(() => trimShareQuote(content), [content]);

    return (
      <View
        ref={ref}
        collapsable={false}
        style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }}>
        <CardRoot>
          <LinearGradient
            colors={['#1A1510', '#100E0B', '#080807']}
            locations={[0, 0.55, 1]}
            style={{ flex: 1 }}>
            <CardInner>
              <TopRow>
                <BrandMark>FILMOLOG</BrandMark>
                {catalogRef ? <CatalogRef>{catalogRef}</CatalogRef> : null}
              </TopRow>

              <MainBlock>
                <PosterFrame>
                  {posterUri ? (
                    <Poster
                      source={{ uri: posterUri }}
                      resizeMode={FastImage.resizeMode.cover}
                      onLoadEnd={onPosterLoad}
                    />
                  ) : (
                    <PosterPlaceholder />
                  )}
                </PosterFrame>

                <MovieTitle numberOfLines={2}>{title}</MovieTitle>
                {subtitle ? (
                  <MovieSubtitle numberOfLines={1}>{subtitle}</MovieSubtitle>
                ) : null}

                <RatingRow>
                  <RatingValue>{formatRating(rating)}</RatingValue>
                  <RatingSuffix>/ 5.0</RatingSuffix>
                </RatingRow>

                {quote ? (
                  <QuoteText numberOfLines={5}>{`"${quote}"`}</QuoteText>
                ) : null}
              </MainBlock>

              <BottomBlock>
                {watchedLabel ? <MetaText>{watchedLabel}</MetaText> : null}
                <FooterMark>filmolog archive</FooterMark>
              </BottomBlock>
            </CardInner>
          </LinearGradient>
        </CardRoot>
      </View>
    );
  },
);

ReviewShareCard.displayName = 'ReviewShareCard';

export default ReviewShareCard;

const CardRoot = styled.View`
  width: ${SHARE_CARD_WIDTH}px;
  height: ${SHARE_CARD_HEIGHT}px;
  overflow: hidden;
  background-color: ${theme.colors.dashboardBackground};
`;

const CardInner = styled.View`
  flex: 1;
  padding: 28px 24px 32px;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BrandMark = styled.Text`
  font-family: ${theme.fonts.displayBold};
  font-size: 11px;
  letter-spacing: 4px;
  color: ${theme.colors.primary};
`;

const CatalogRef = styled.Text`
  font-family: ${theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 1px;
  color: ${theme.colors.primaryMuted};
`;

const MainBlock = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  gap: 6px;
`;

const PosterFrame = styled.View`
  width: 200px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${theme.colors.posterBorder};
  background-color: ${theme.colors.posterMat};
  margin-bottom: 8px;
`;

const Poster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const PosterPlaceholder = styled.View`
  flex: 1;
  background-color: ${theme.colors.posterPlaceholderBackground};
`;

const MovieTitle = styled.Text`
  margin-top: 4px;
  font-family: ${theme.fonts.displayBold};
  font-size: 24px;
  line-height: 30px;
  text-align: center;
  color: ${theme.colors.goldBright};
`;

const MovieSubtitle = styled.Text`
  font-family: ${theme.fonts.bodyLight};
  font-size: 13px;
  text-align: center;
  color: ${theme.colors.primaryMuted};
`;

const RatingRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: 4px;
  margin-top: 8px;
`;

const RatingValue = styled.Text`
  font-family: ${theme.fonts.displayBold};
  font-size: 36px;
  color: ${theme.colors.primary};
`;

const RatingSuffix = styled.Text`
  font-family: ${theme.fonts.bodyLight};
  font-size: 14px;
  color: ${theme.colors.dashboardText};
`;

const QuoteText = styled.Text`
  width: 100%;
  margin-top: 12px;
  padding-horizontal: 4px;
  font-family: ${theme.fonts.body};
  font-size: 15px;
  line-height: 24px;
  text-align: center;
  color: ${theme.colors.goldSoft};
`;

const BottomBlock = styled.View`
  align-items: center;
  gap: 8px;
  padding-top: 12px;
`;

const MetaText = styled.Text`
  font-family: ${theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.3px;
  color: ${theme.colors.dashboardText};
  text-align: center;
`;

const FooterMark = styled.Text`
  font-family: ${theme.fonts.bodyLight};
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${theme.colors.goldDim};
`;

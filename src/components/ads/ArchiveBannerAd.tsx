import { useWindowDimensions } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import styled from 'styled-components/native';

import { AD_UNITS } from '../../lib/ads';
import { theme } from '../../theme';

type ArchiveBannerAdProps = {
  label?: string;
};

function ArchiveBannerAd({ label = 'Sponsored' }: ArchiveBannerAdProps) {
  const { width } = useWindowDimensions();
  const adWidth = Math.round(width - 40);

  return (
    <Frame>
      <SponsorLabel>{label}</SponsorLabel>
      <BannerAd
        unitId={AD_UNITS.BANNER}
        size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
        width={adWidth}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </Frame>
  );
}

export default ArchiveBannerAd;

const Frame = styled.View`
  align-items: center;
  gap: 8px;
  padding-vertical: 4px;
`;

const SponsorLabel = styled.Text`
  width: 100%;
  font-family: ${theme.fonts.bodyLight};
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${theme.colors.goldDim};
`;

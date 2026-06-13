import { useEffect, useState } from 'react';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import styled from 'styled-components/native';

import { AD_UNITS } from '../../lib/ads';
import { theme } from '../../theme';

function ArchiveNativeAd() {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

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
        // 광고 로드 실패 시 슬롯 숨김
      });

    return () => {
      cancelled = true;
      ad?.destroy();
    };
  }, []);

  if (!nativeAd) {
    return null;
  }

  return (
    <Card>
      <SponsorRow>
        <SponsorLabel>Sponsored</SponsorLabel>
        {nativeAd.advertiser ? (
          <AdvertiserText numberOfLines={1}>{nativeAd.advertiser}</AdvertiserText>
        ) : null}
      </SponsorRow>

      <NativeAdView nativeAd={nativeAd}>
        <ContentRow>
          <MediaWrap>
            <NativeMediaView resizeMode="cover" style={{ width: '100%', height: '100%' }} />
          </MediaWrap>

          <CopyCol>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Headline numberOfLines={2}>{nativeAd.headline}</Headline>
            </NativeAsset>

            {nativeAd.body ? (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Body numberOfLines={2}>{nativeAd.body}</Body>
              </NativeAsset>
            ) : null}

            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <Cta numberOfLines={1}>{nativeAd.callToAction}</Cta>
            </NativeAsset>
          </CopyCol>
        </ContentRow>
      </NativeAdView>
    </Card>
  );
}

export default ArchiveNativeAd;

const Card = styled.View`
  border-width: 1px;
  border-color: ${theme.colors.dashborderBorder};
  border-radius: 8px;
  background-color: ${theme.colors.surfaceRaised};
  padding: 14px;
  gap: 10px;
`;

const SponsorRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SponsorLabel = styled.Text`
  font-family: ${theme.fonts.bodyLight};
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${theme.colors.goldDim};
`;

const AdvertiserText = styled.Text`
  flex: 1;
  font-family: ${theme.fonts.bodyLight};
  font-size: 10px;
  color: ${theme.colors.dashboardText};
  text-align: right;
`;

const ContentRow = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const MediaWrap = styled.View`
  width: 96px;
  height: 96px;
  border-radius: 6px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${theme.colors.posterBorder};
  background-color: ${theme.colors.posterMat};
`;

const CopyCol = styled.View`
  flex: 1;
  justify-content: center;
  gap: 6px;
`;

const Headline = styled.Text`
  font-family: ${theme.fonts.displayBold};
  font-size: 15px;
  line-height: 20px;
  color: ${theme.colors.goldBright};
`;

const Body = styled.Text`
  font-family: ${theme.fonts.body};
  font-size: 12px;
  line-height: 18px;
  color: ${theme.colors.dashboardText};
`;

const Cta = styled.Text`
  align-self: flex-start;
  margin-top: 2px;
  padding: 6px 10px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${theme.colors.primaryMuted};
  font-family: ${theme.fonts.bodyMedium};
  font-size: 11px;
  letter-spacing: 0.4px;
  color: ${theme.colors.primary};
`;

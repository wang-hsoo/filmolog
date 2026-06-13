import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { openTmdbWebsite } from '../../lib/links/legalLinks';

const TMDB_ATTRIBUTION_EN =
  'This product uses the TMDB API but is not endorsed or certified by TMDB.';

type TmdbAttributionProps = {
  compact?: boolean;
};

function TmdbAttribution({ compact = false }: TmdbAttributionProps) {
  const { t } = useTranslation();
  const handlePress = () => {
    void openTmdbWebsite().catch(() => undefined);
  };

  return (
    <AttributionRoot $compact={compact}>
      <AttributionOverline>DATA SOURCE</AttributionOverline>
      <AttributionLabel>{t('common.attribution.movieInfoProvider')}</AttributionLabel>
      <AttributionLink onPress={handlePress} accessibilityRole="link">
        <AttributionLinkText>The Movie Database (TMDB)</AttributionLinkText>
      </AttributionLink>
      <AttributionNotice>{TMDB_ATTRIBUTION_EN}</AttributionNotice>
    </AttributionRoot>
  );
}

export default TmdbAttribution;

const AttributionRoot = styled.View<{ $compact: boolean }>`
  padding: ${({ $compact }) => ($compact ? '14px 16px' : '16px')};
  gap: 6px;
`;

const AttributionOverline = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 9px;
  letter-spacing: 1.6px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const AttributionLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const AttributionLink = styled(Pressable)`
  align-self: flex-start;
`;

const AttributionLinkText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldBright};
  text-decoration-line: underline;
  text-decoration-color: ${({ theme }) => theme.colors.primaryMuted};
`;

const AttributionNotice = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

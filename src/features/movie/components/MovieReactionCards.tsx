import { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import MciIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import {
  REACTION_ICONS,
  REACTION_KEYS,
  type ReactionKey,
} from '../../../components';
import { getReactionLabel } from '../../../i18n/labels';
import { theme } from '../../../theme';

type MovieReactionCardsProps = {
  reactionCounts: Record<ReactionKey, number>;
};

function formatCompactCount(count: number, locale: string): string {
  if (count < 1000) {
    return String(count);
  }

  if (locale.startsWith('ko')) {
    if (count >= 10000) {
      const value = count / 10000;
      const formatted =
        value >= 10
          ? String(Math.round(value))
          : value.toFixed(1).replace(/\.0$/, '');
      return `${formatted}만`;
    }

    const value = count / 1000;
    const formatted =
      value >= 10
        ? String(Math.round(value))
        : value.toFixed(1).replace(/\.0$/, '');
    return `${formatted}천`;
  }

  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${value.toFixed(1).replace(/\.0$/, '')}M`;
  }

  const value = count / 1000;
  return `${value.toFixed(1).replace(/\.0$/, '')}k`;
}

function MovieReactionCards({ reactionCounts }: MovieReactionCardsProps) {
  const { t, i18n } = useTranslation();

  const visibleKeys = useMemo(
    () => REACTION_KEYS.filter(key => reactionCounts[key] > 0),
    [reactionCounts],
  );

  if (visibleKeys.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {visibleKeys.map(key => {
        const count = reactionCounts[key];

        return (
          <ReactionCard key={key}>
            <ReactionCardTop>
              <MciIcon
                name={REACTION_ICONS[key]}
                size={18}
                color={theme.colors.dashboardIcon}
              />
              <ReactionCardLabel numberOfLines={3}>
                {getReactionLabel(t, key)}
              </ReactionCardLabel>
            </ReactionCardTop>
            <ReactionCardCount>
              {formatCompactCount(count, i18n.language)}
            </ReactionCardCount>
          </ReactionCard>
        );
      })}
    </ScrollView>
  );
}

export default MovieReactionCards;

const ReactionCard = styled.View`
  width: 132px;
  min-height: 108px;
  padding: 12px 10px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
  justify-content: space-between;
  gap: 10px;
`;

const ReactionCardTop = styled.View`
  align-items: center;
  gap: 6px;
`;

const ReactionCardLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 12px;
  line-height: 17px;
  text-align: center;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const ReactionCardCount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.goldBright};
`;

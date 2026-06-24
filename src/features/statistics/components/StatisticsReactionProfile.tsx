import { useTranslation } from 'react-i18next';
import MciIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { REACTION_ICONS } from '../../../components';
import { getReactionLabel } from '../../../i18n/labels';
import { theme } from '../../../theme';

import type { ReactionProfileItem } from '../utils/reviewStats';

type StatisticsReactionProfileProps = {
  items: ReactionProfileItem[];
  emptyMessage?: string;
};

function StatisticsReactionProfile({
  items,
  emptyMessage,
}: StatisticsReactionProfileProps) {
  const { t } = useTranslation();
  const resolvedEmptyMessage =
    emptyMessage ?? t('statistics.sections.reactions.empty');

  if (items.length === 0) {
    return <EmptyText>{resolvedEmptyMessage}</EmptyText>;
  }

  return (
    <ProfileList>
      {items.map(item => (
        <ProfileRow key={item.key}>
          <ProfileLabelWrap>
            <MciIcon
              name={REACTION_ICONS[item.key]}
              size={16}
              color={theme.colors.dashboardIcon}
            />
            <ProfileLabel numberOfLines={2}>
              {getReactionLabel(t, item.key)}
            </ProfileLabel>
          </ProfileLabelWrap>
          <ProfileTrack>
            <ProfileFill style={{ width: `${item.percent}%` }} />
          </ProfileTrack>
          <ProfileMeta>
            {item.percent}% · {item.count}
          </ProfileMeta>
        </ProfileRow>
      ))}
    </ProfileList>
  );
}

export default StatisticsReactionProfile;

const EmptyText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const ProfileList = styled.View`
  gap: 12px;
`;

const ProfileRow = styled.View`
  gap: 6px;
`;

const ProfileLabelWrap = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ProfileLabel = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const ProfileTrack = styled.View`
  height: 6px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

const ProfileFill = styled.View`
  height: 100%;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const ProfileMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

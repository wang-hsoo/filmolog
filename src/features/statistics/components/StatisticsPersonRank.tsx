import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';

import { ArchiveEmptyText } from '../../../components';

import type { PersonRank } from '../utils/reviewStats';

type StatisticsPersonRankProps = {
  items: PersonRank[];
  emptyMessage?: string;
  valueSuffix?: string;
};

function StatisticsPersonRank({
  items,
  emptyMessage,
  valueSuffix,
}: StatisticsPersonRankProps) {
  const { t } = useTranslation();
  const resolvedEmptyMessage = emptyMessage ?? t('common.archive.noData');
  const formatCount = (count: number) => {
    if (valueSuffix !== undefined) {
      return `${count}${valueSuffix}`;
    }

    return t('common.units.filmCount', { count });
  };
  const maxValue = Math.max(...items.map(item => item.count), 1);
  const hasData = items.some(item => item.count > 0);

  if (!hasData) {
    return <ArchiveEmptyText>{resolvedEmptyMessage}</ArchiveEmptyText>;
  }

  return (
    <RankRoot>
      {items.map((item, index) => {
        const widthPct = Math.max((item.count / maxValue) * 100, 8);

        return (
          <RankRow key={item.personId}>
            <RankIndex>{index + 1}</RankIndex>
            <RankBody>
              <RankHeader>
                <RankName numberOfLines={1}>{item.name}</RankName>
                <RankCount>{formatCount(item.count)}</RankCount>
              </RankHeader>
              <RankTrack>
                <RankFill style={{ width: `${widthPct}%` }} />
              </RankTrack>
            </RankBody>
          </RankRow>
        );
      })}
    </RankRoot>
  );
}

export default StatisticsPersonRank;

const RankRoot = styled.View`
  gap: 10px;
`;

const RankRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
`;

const RankIndex = styled.Text`
  width: 18px;
  margin-top: 2px;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const RankBody = styled.View`
  flex: 1;
  gap: 6px;
`;

const RankHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const RankName = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const RankCount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const RankTrack = styled.View`
  height: 6px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  overflow: hidden;
`;

const RankFill = styled.View`
  height: 100%;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

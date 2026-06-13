import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';

import { ArchiveEmptyText } from '../../../components';

type BarItem = {
  label: string;
  value: number;
};

type StatisticsBarChartProps = {
  items: BarItem[];
  emptyMessage?: string;
  valueSuffix?: string;
};

function StatisticsBarChart({
  items,
  emptyMessage,
  valueSuffix = '',
}: StatisticsBarChartProps) {
  const { t } = useTranslation();
  const resolvedEmptyMessage = emptyMessage ?? t('common.archive.noData');
  const maxValue = Math.max(...items.map(item => item.value), 1);
  const hasData = items.some(item => item.value > 0);

  if (!hasData) {
    return <ArchiveEmptyText>{resolvedEmptyMessage}</ArchiveEmptyText>;
  }

  return (
    <ChartRoot>
      {items.map(item => {
        const heightPct = Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0);

        return (
          <BarColumn key={item.label}>
            <BarValue>
              {item.value}
              {valueSuffix}
            </BarValue>
            <BarTrack>
              <BarFill style={{ height: `${heightPct}%` }} />
            </BarTrack>
            <BarLabel>{item.label}</BarLabel>
          </BarColumn>
        );
      })}
    </ChartRoot>
  );
}

export default StatisticsBarChart;

const ChartRoot = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  min-height: 148px;
  padding-top: 8px;
`;

const BarColumn = styled.View`
  flex: 1;
  align-items: center;
  gap: 8px;
`;

const BarValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const BarTrack = styled.View`
  width: 100%;
  max-width: 36px;
  height: 96px;
  justify-content: flex-end;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  overflow: hidden;
`;

const BarFill = styled.View`
  width: 100%;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const BarLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

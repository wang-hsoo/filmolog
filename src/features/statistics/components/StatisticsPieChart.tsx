import Svg, { Path } from 'react-native-svg';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';

import { ArchiveEmptyText } from '../../../components';

import type { GenreSlice } from '../utils/reviewStats';

const SIZE = 168;
const OUTER_RADIUS = SIZE / 2;
const INNER_RADIUS = OUTER_RADIUS * 0.56;

type StatisticsPieChartProps = {
  slices: GenreSlice[];
  emptyMessage?: string;
};

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  if (endAngle - startAngle >= 360) {
    endAngle = startAngle + 359.999;
  }

  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

function StatisticsPieChart({
  slices,
  emptyMessage,
}: StatisticsPieChartProps) {
  const { t } = useTranslation();
  const resolvedEmptyMessage = emptyMessage ?? t('common.archive.noData');
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  if (total === 0 || slices.length === 0) {
    return <ArchiveEmptyText>{resolvedEmptyMessage}</ArchiveEmptyText>;
  }

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  let currentAngle = 0;

  const paths = slices.map(slice => {
    const sweep = (slice.count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;
    currentAngle = endAngle;

    return {
      key: slice.genreId,
      color: slice.color,
      d: describeDonutSlice(
        cx,
        cy,
        OUTER_RADIUS,
        INNER_RADIUS,
        startAngle,
        endAngle,
      ),
    };
  });

  return (
    <ChartRoot>
      <PieFrame>
        <Svg width={SIZE} height={SIZE}>
          {paths.map(path => (
            <Path key={path.key} d={path.d} fill={path.color} />
          ))}
        </Svg>
        <CenterHole />
      </PieFrame>

      <Legend>
        {slices.map(slice => (
          <LegendRow key={slice.genreId}>
            <LegendSwatch style={{ backgroundColor: slice.color }} />
            <LegendLabel numberOfLines={1}>{slice.label}</LegendLabel>
            <LegendValue>
              {slice.percent}% · {slice.count}
            </LegendValue>
          </LegendRow>
        ))}
      </Legend>
    </ChartRoot>
  );
}

export default StatisticsPieChart;

const ChartRoot = styled.View`
  gap: 16px;
`;

const PieFrame = styled.View`
  align-self: center;
  width: ${SIZE}px;
  height: ${SIZE}px;
  align-items: center;
  justify-content: center;
`;

const CenterHole = styled.View`
  position: absolute;
  width: ${INNER_RADIUS * 2}px;
  height: ${INNER_RADIUS * 2}px;
  border-radius: ${INNER_RADIUS}px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const Legend = styled.View`
  gap: 8px;
`;

const LegendRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const LegendSwatch = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 999px;
`;

const LegendLabel = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const LegendValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

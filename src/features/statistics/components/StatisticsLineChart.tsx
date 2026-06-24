import { useMemo, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';
import { useTranslation } from 'react-i18next';

import { ArchiveEmptyText } from '../../../components';

type LineItem = {
  label: string;
  value: number;
};

type StatisticsLineChartProps = {
  items: LineItem[];
  emptyMessage?: string;
  valueSuffix?: string;
};

const CHART_HEIGHT = 132;
const PADDING_LEFT = 8;
const PADDING_RIGHT = 8;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;

function StatisticsLineChart({
  items,
  emptyMessage,
  valueSuffix = '',
}: StatisticsLineChartProps) {
  const theme = useTheme();
  const { t: translate } = useTranslation();
  const resolvedEmptyMessage = emptyMessage ?? translate('common.archive.noData');
  const [chartWidth, setChartWidth] = useState(0);

  const hasData = items.some(item => item.value > 0);

  const geometry = useMemo(() => {
    if (chartWidth <= 0 || items.length === 0) {
      return null;
    }

    const plotWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const maxValue = Math.max(...items.map(item => item.value), 1);
    const stepX = items.length > 1 ? plotWidth / (items.length - 1) : 0;

    const points = items.map((item, index) => {
      const x = PADDING_LEFT + stepX * index;
      const y =
        PADDING_TOP +
        plotHeight -
        (item.value / maxValue) * plotHeight;

      return { ...item, x, y };
    });

    const polyline = points.map(point => `${point.x},${point.y}`).join(' ');

    return { points, polyline, plotHeight, maxValue };
  }, [chartWidth, items]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  if (!hasData) {
    return <ArchiveEmptyText>{resolvedEmptyMessage}</ArchiveEmptyText>;
  }

  return (
    <ChartRoot onLayout={handleLayout}>
      {geometry ? (
        <>
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Line
              x1={PADDING_LEFT}
              y1={CHART_HEIGHT - PADDING_BOTTOM}
              x2={chartWidth - PADDING_RIGHT}
              y2={CHART_HEIGHT - PADDING_BOTTOM}
              stroke={theme.colors.goldLine}
              strokeWidth={1}
            />
            <Polyline
              points={geometry.polyline}
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {geometry.points.map(point => (
              <Circle
                key={point.label}
                cx={point.x}
                cy={point.y}
                r={3.5}
                fill={theme.colors.primary}
              />
            ))}
          </Svg>
          <LabelRow>
            {items.map((item, index) => {
              const showLabel =
                items.length <= 6 ||
                index === 0 ||
                index === items.length - 1 ||
                index % 2 === 0;

              if (!showLabel) {
                return <LabelSlot key={item.label} />;
              }

              return (
                <LabelSlot key={item.label}>
                  <AxisLabel numberOfLines={1}>{item.label}</AxisLabel>
                  <AxisValue>
                    {item.value}
                    {valueSuffix}
                  </AxisValue>
                </LabelSlot>
              );
            })}
          </LabelRow>
        </>
      ) : (
        <ChartPlaceholder />
      )}
    </ChartRoot>
  );
}

export default StatisticsLineChart;

const ChartRoot = styled.View`
  width: 100%;
`;

const ChartPlaceholder = styled.View`
  height: ${CHART_HEIGHT}px;
`;

const LabelRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 2px;
  margin-top: 2px;
`;

const LabelSlot = styled.View`
  flex: 1;
  align-items: center;
  min-width: 0;
`;

const AxisLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dashboardText};
  text-align: center;
`;

const AxisValue = styled.Text`
  margin-top: 2px;
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.primaryMuted};
  text-align: center;
`;

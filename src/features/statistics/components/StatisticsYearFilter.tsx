import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import type { StatsYearFilter } from '../utils/reviewStats';

type StatisticsYearFilterProps = {
  years: number[];
  value: StatsYearFilter;
  onChange: (value: StatsYearFilter) => void;
};

function StatisticsYearFilter({
  years,
  value,
  onChange,
}: StatisticsYearFilterProps) {
  const { t } = useTranslation();

  return (
    <Root>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        <YearChip
          $active={value === 'all'}
          onPress={() => onChange('all')}
          accessibilityRole="button"
          accessibilityState={{ selected: value === 'all' }}>
          <YearChipLabel $active={value === 'all'}>
            {t('statistics.yearFilter.all')}
          </YearChipLabel>
        </YearChip>
        {years.map(year => (
          <YearChip
            key={year}
            $active={value === year}
            onPress={() => onChange(year)}
            accessibilityRole="button"
            accessibilityState={{ selected: value === year }}>
            <YearChipLabel $active={value === year}>{year}</YearChipLabel>
          </YearChip>
        ))}
      </ScrollView>
    </Root>
  );
}

export default StatisticsYearFilter;

const Root = styled.View`
  width: 100%;
`;

const YearChip = styled.Pressable<{ $active: boolean }>`
  padding: 8px 14px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const YearChipLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 13px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.goldBright : theme.colors.dashboardText};
`;

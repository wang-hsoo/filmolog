import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import type {
  ReviewLogMonthFilter,
  ReviewLogYearFilter,
} from '../utils/reviewLogUtils';

type ReviewLogDateFilterProps = {
  years: number[];
  yearFilter: ReviewLogYearFilter;
  monthFilter: ReviewLogMonthFilter;
  onYearChange: (value: ReviewLogYearFilter) => void;
  onMonthChange: (value: ReviewLogMonthFilter) => void;
};

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function ReviewLogDateFilter({
  years,
  yearFilter,
  monthFilter,
  onYearChange,
  onMonthChange,
}: ReviewLogDateFilterProps) {
  const { t } = useTranslation();

  return (
    <Root>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        <FilterChip
          $active={yearFilter === 'all'}
          onPress={() => onYearChange('all')}
          accessibilityRole="button"
          accessibilityState={{ selected: yearFilter === 'all' }}>
          <FilterChipLabel $active={yearFilter === 'all'}>
            {t('review.list.yearFilter.all')}
          </FilterChipLabel>
        </FilterChip>
        {years.map(year => (
          <FilterChip
            key={year}
            $active={yearFilter === year}
            onPress={() => onYearChange(year)}
            accessibilityRole="button"
            accessibilityState={{ selected: yearFilter === year }}>
            <FilterChipLabel $active={yearFilter === year}>{year}</FilterChipLabel>
          </FilterChip>
        ))}
      </ScrollView>

      {yearFilter !== 'all' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          <FilterChip
            $active={monthFilter === 'all'}
            onPress={() => onMonthChange('all')}
            accessibilityRole="button"
            accessibilityState={{ selected: monthFilter === 'all' }}>
            <FilterChipLabel $active={monthFilter === 'all'}>
              {t('review.list.monthFilter.all')}
            </FilterChipLabel>
          </FilterChip>
          {MONTHS.map(month => (
            <FilterChip
              key={month}
              $active={monthFilter === month}
              onPress={() => onMonthChange(month)}
              accessibilityRole="button"
              accessibilityState={{ selected: monthFilter === month }}>
              <FilterChipLabel $active={monthFilter === month}>
                {t('common.movieMeta.monthLabel', { month })}
              </FilterChipLabel>
            </FilterChip>
          ))}
        </ScrollView>
      ) : null}
    </Root>
  );
}

export default ReviewLogDateFilter;

const Root = styled.View`
  gap: 8px;
  padding: 0 20px 14px;
`;

const FilterChip = styled.Pressable<{ $active: boolean }>`
  padding: 8px 14px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const FilterChipLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 13px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.goldBright : theme.colors.dashboardText};
`;

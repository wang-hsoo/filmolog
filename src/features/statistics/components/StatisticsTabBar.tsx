import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

export type StatisticsTabKey = 'overview' | 'time' | 'taste' | 'highlights';

type StatisticsTabBarProps = {
  value: StatisticsTabKey;
  onChange: (value: StatisticsTabKey) => void;
};

const TAB_KEYS: StatisticsTabKey[] = [
  'overview',
  'time',
  'taste',
  'highlights',
];

function StatisticsTabBar({ value, onChange }: StatisticsTabBarProps) {
  const { t } = useTranslation();

  return (
    <TabRow>
      {TAB_KEYS.map(key => (
        <TabButton
          key={key}
          $active={value === key}
          onPress={() => onChange(key)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === key }}>
          <TabLabel $active={value === key}>
            {t(`statistics.tabs.${key}`)}
          </TabLabel>
        </TabButton>
      ))}
    </TabRow>
  );
}

export default StatisticsTabBar;

const TabRow = styled.View`
  flex-direction: row;
  gap: 6px;
`;

const TabButton = styled.Pressable<{ $active: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const TabLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 12px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.goldBright : theme.colors.dashboardText};
  text-align: center;
`;

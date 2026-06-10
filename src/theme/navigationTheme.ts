import { DarkTheme, type Theme } from '@react-navigation/native';

import { theme } from './theme';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.appBackground,
    card: theme.colors.appBackground,
    border: theme.colors.tabBarBorder,
  },
};

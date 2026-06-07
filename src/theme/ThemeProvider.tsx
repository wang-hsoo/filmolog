import type { PropsWithChildren } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { theme } from './theme';

export function ThemeProvider({ children }: PropsWithChildren) {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
}

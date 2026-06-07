export const theme = {
  colors: {
    primary: '#A18362',
    splashBackground: '#070606',
    appBackground: '#070606',
    buttonColor: '#ffffff',
    defaultText: '#333333',
    whiteText: '#ffffff',
  },
} as const;

export type AppTheme = typeof theme;

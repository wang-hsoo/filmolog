export const theme = {
  colors: {
    primary: '#A18362',
    splashBackground: '#070606',
    appBackground: '#070606',
    tabBarBackground: '#101010',
    buttonColor: '#ffffff',
    defaultText: '#333333',
    whiteText: '#ffffff',
    dashboardBackground: '#161512',
    dashborderBorder: '#1F1E1D',
    dashboardText: '#A18362',
    dashboardValue: '#D6BBA1',
    dashbordItemBorder: '#292825'
  },
} as const;

export type AppTheme = typeof theme;

const dashboardStyles = {
  dashboardIcon: "#9A8163",
  dashboardBackground: '#161512',
  dashborderBorder: '#1F1E1D',
  dashboardText: '#A19489',
  dashboardValue: '#D6BBA1',
  dashbordItemBorder: '#2D2A26',
}

const actionstyles = {
  actionButtonBorder: '#1B1916',
  actionButtonBackground: '#1E1B17CC'
}

const tabBarStyles = {
  tabBarBackground: '#101010',
  tabBarBorder: '#302C26',
}

export const theme = {
  colors: {
    primary: '#A18362',
    splashBackground: '#070606',
    appBackground: '#070606',
    buttonColor: '#ffffff',
    
    defaultText: '#333333',
    whiteText: '#ffffff',

    ...tabBarStyles,

    ...dashboardStyles,

    ...actionstyles,

  },
} as const;

export type AppTheme = typeof theme;

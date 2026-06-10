import { fonts } from './typography';

/** 블랙 · 브론즈/골드 · 아카이브 컬렉터 팔레트 */
const archiveColors = {
  // 배경
  appBackground: '#000000',
  splashBackground: '#000000',
  surface: '#0A0908',
  surfaceRaised: '#110F0D',

  // 골드 / 브론즈 스케일
  primary: '#B8956B',
  primaryMuted: '#8A7052',
  goldBright: '#D9C4A0',
  goldSoft: '#C4A882',
  goldDim: '#5E5348',
  goldLine: '#3D3226',

  // 텍스트
  headerTitle: '#D9C4A0',
  dashboardText: '#7A6F63',
  dashboardValue: '#D4B896',
  dashboardIcon: '#A68B62',
  placeholderText: '#6B6258',
  whiteText: '#F5F0E8',

  // 패널 · 보더
  dashboardBackground: '#0C0B09',
  dashborderBorder: '#1C1814',
  dashborderBorderAccent: '#2E261C',
  dashbordItemBorder: '#241F18',

  // 포스터 액자
  posterBorder: '#4A3D30',
  posterMat: '#0F0D0B',
  posterPlaceholderBackground: '#080807',

  // 탭바 · 액션
  tabBarBackground: '#000000',
  tabBarBorder: '#2A2318',
  tabBarInactive: '#5E5348',
  actionButtonBorder: '#1A1612',
  actionButtonBackground: '#110F0DCC',
  searchBorder: '#1C1814',

  // 레거시 alias (기존 키 호환)
  buttonColor: '#F5F0E8',
  defaultText: '#7A6F63',
};

export const theme = {
  fonts,
  radii: {
    panel: 8,
    poster: 3,
    search: 6,
  },
  colors: archiveColors,
} as const;

export type AppTheme = typeof theme;

import { Platform } from 'react-native';

/** 커스텀 폰트 연결 전 — 홈 FILMOLOG 세리프 톤 fallback */
export const brandSerif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
}) as string;

export const brandLetterSpacing = 5;

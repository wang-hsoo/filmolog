/** Google 공식 테스트 광고 단위 — 출시 전 실제 ID로 교체 */
export const AD_UNITS = {
  BANNER: __DEV__
    ? 'ca-app-pub-3940256099942544/6300978111'
    : 'ca-app-pub-4376785638228449/8656855804',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  NATIVE: __DEV__
    ? 'ca-app-pub-3940256099942544/2247696110'
    : 'ca-app-pub-4376785638228449/5956303752',
} as const;

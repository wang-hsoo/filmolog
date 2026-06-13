import {
  AdEventType,
  InterstitialAd,
} from 'react-native-google-mobile-ads';

import { AD_UNITS } from './adUnits';

const COOLDOWN_MS = 3 * 60 * 1000;

let interstitial = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL);
let isLoaded = false;
let lastShownAt = 0;
let listenersAttached = false;

function attachListeners() {
  if (listenersAttached) {
    return;
  }

  listenersAttached = true;

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    isLoaded = false;
    preloadInterstitialAd();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    isLoaded = false;
  });
}

export function preloadInterstitialAd() {
  attachListeners();
  interstitial.load();
}

export function showInterstitialIfReady(): Promise<void> {
  attachListeners();

  if (!isLoaded || Date.now() - lastShownAt < COOLDOWN_MS) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubscribe();
        resolve();
      },
    );

    lastShownAt = Date.now();
    isLoaded = false;
    interstitial.show();
  });
}

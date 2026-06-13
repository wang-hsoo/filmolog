import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

import { AD_UNITS } from './adUnits';

let rewarded = RewardedAd.createForAdRequest(AD_UNITS.REWARDED);
let isLoaded = false;
let listenersAttached = false;

function attachListeners() {
  if (listenersAttached) {
    return;
  }

  listenersAttached = true;

  rewarded.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
  });

  rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    isLoaded = false;
    preloadRewardedAd();
  });

  rewarded.addAdEventListener(AdEventType.ERROR, () => {
    isLoaded = false;
  });
}

export function preloadRewardedAd() {
  attachListeners();
  rewarded.load();
}

export function showRewardedIfReady(): Promise<boolean> {
  attachListeners();

  if (!isLoaded) {
    return Promise.resolve(false);
  }

  return new Promise(resolve => {
    let earned = false;

    const earnedUnsub = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
      },
    );

    const closedUnsub = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      earnedUnsub();
      closedUnsub();
      resolve(earned);
    });

    isLoaded = false;
    rewarded.show();
  });
}

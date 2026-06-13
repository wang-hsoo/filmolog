import { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';

import { preloadRewardedAd } from '../../lib/ads';

function AdBootstrap() {
  useEffect(() => {
    let cancelled = false;

    mobileAds()
      .initialize()
      .then(() => {
        if (!cancelled) {
          preloadRewardedAd();
        }
      })
      .catch(error => {
        console.warn('[AdBootstrap] initialize failed', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

export default AdBootstrap;

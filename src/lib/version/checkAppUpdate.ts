import { Linking, Platform } from 'react-native';
import { checkVersion } from 'react-native-check-version';
import DeviceInfo from 'react-native-device-info';

import { archiveAlert } from '../dialog/archiveDialog';
import { i18n } from '../../i18n';

import { FORCE_UPDATE_GAP, getVersionGap } from './compareVersions';

const ANDROID_PACKAGE = 'com.filmolog';
const STORE_COUNTRY = 'kr';

export type AppUpdateCheckResult = {
  needsUpdate: boolean;
  force: boolean;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string | null;
};

async function openStoreUrl(url: string | null) {
  const fallback =
    Platform.OS === 'ios'
      ? 'https://apps.apple.com'
      : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

  const target = url && url.length > 0 ? url : fallback;

  try {
    const canOpen = await Linking.canOpenURL(target);
    if (canOpen) {
      await Linking.openURL(target);
      return;
    }
  } catch {
    // fall through
  }

  await Linking.openURL(fallback);
}

export async function checkAppUpdate(): Promise<AppUpdateCheckResult | null> {
  const currentVersion = DeviceInfo.getVersion();
  const bundleId =
    Platform.OS === 'android' ? ANDROID_PACKAGE : DeviceInfo.getBundleId();

  try {
    const result = await checkVersion({
      bundleId,
      country: STORE_COUNTRY,
      currentVersion,
    });

    if (result.error || !result.needsUpdate || !result.version) {
      return null;
    }

    const gap = getVersionGap(currentVersion, result.version);
    if (gap <= 0) {
      return null;
    }

    return {
      needsUpdate: true,
      force: gap >= FORCE_UPDATE_GAP,
      currentVersion,
      latestVersion: result.version,
      storeUrl: result.url ?? null,
    };
  } catch (error) {
    console.warn('[checkAppUpdate] failed', error);
    return null;
  }
}

export function promptAppUpdate(update: AppUpdateCheckResult) {
  const openStore = () => {
    void openStoreUrl(update.storeUrl);
  };

  if (update.force) {
    archiveAlert(
      i18n.t('dialogs.appUpdate.forceTitle'),
      i18n.t('dialogs.appUpdate.forceMessage', {
        current: update.currentVersion,
        latest: update.latestVersion,
      }),
      [
        {
          text: i18n.t('dialogs.appUpdate.update'),
          style: 'default',
          onPress: openStore,
        },
      ],
      { dismissible: false },
    );
    return;
  }

  archiveAlert(
    i18n.t('dialogs.appUpdate.title'),
    i18n.t('dialogs.appUpdate.message', {
      current: update.currentVersion,
      latest: update.latestVersion,
    }),
    [
      {
        text: i18n.t('dialogs.appUpdate.later'),
        style: 'cancel',
      },
      {
        text: i18n.t('dialogs.appUpdate.update'),
        style: 'default',
        onPress: openStore,
      },
    ],
  );
}

export function getAppVersion() {
  return DeviceInfo.getVersion();
}

import { PermissionsAndroid, Platform } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import { i18n } from '../../../i18n';

import {
  CALENDAR_SHARE_EXPORT_HEIGHT,
  CALENDAR_SHARE_EXPORT_WIDTH,
} from '../components/ReviewCalendarShareCard';

function waitForNextFrames(frameCount = 3) {
  return new Promise<void>(resolve => {
    let remaining = frameCount;

    const step = () => {
      remaining -= 1;
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  });
}

function waitForPosterWarmup(timeoutMs = 1200) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeoutMs);
  });
}

/** Android 9 이하에서만 갤러리 쓰기 권한 요청. API 29+는 MediaStore insert로 READ 불필요 */
async function ensureAndroidSavePermission() {
  if (Platform.OS !== 'android' || Platform.Version >= 29) {
    return true;
  }

  if (Platform.Version >= 23) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}

async function captureCalendarCard(cardRef: RefObject<View | null>) {
  if (!cardRef.current) {
    throw new Error('missing-card');
  }

  await waitForPosterWarmup();
  await waitForNextFrames();

  return captureRef(cardRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    width: CALENDAR_SHARE_EXPORT_WIDTH,
    height: CALENDAR_SHARE_EXPORT_HEIGHT,
  });
}

export async function saveCalendarGalleryImage(
  cardRef: RefObject<View | null>,
) {
  const hasPermission = await ensureAndroidSavePermission();

  if (!hasPermission) {
    throw new Error('permission-denied');
  }

  const uri = await captureCalendarCard(cardRef);

  await CameraRoll.save(uri, {
    type: 'photo',
    album: 'Filmolog',
  });

  return uri;
}

export async function shareCalendarGalleryImage(
  cardRef: RefObject<View | null>,
  message: string,
) {
  const uri = await captureCalendarCard(cardRef);

  await Share.open({
    title: i18n.t('review.calendar.shareTitle'),
    message: Platform.OS === 'android' ? message : undefined,
    url: uri,
    type: 'image/png',
    failOnCancel: false,
  });
}

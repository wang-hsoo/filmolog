import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import { i18n } from '../../../i18n';

import { formatRating } from '../../filmLog/utils/rating';
import {
  SHARE_CARD_EXPORT_HEIGHT,
  SHARE_CARD_EXPORT_WIDTH,
} from '../components/ReviewShareCard';

type ShareReviewImageInput = {
  cardRef: RefObject<View | null>;
  posterUri: string | null;
  posterReadyRef: RefObject<boolean>;
  title: string;
  rating: number;
  watchedLabel: string | null;
  content: string | null;
};

function buildShareMessage({
  title,
  rating,
  watchedLabel,
  content,
}: Omit<ShareReviewImageInput, 'cardRef' | 'posterUri' | 'posterReadyRef'>) {
  return [
    `🎬 ${title}`,
    `⭐ ${formatRating(rating)}`,
    watchedLabel ? `📅 ${watchedLabel}` : null,
    content?.trim() ? `\n${content.trim()}` : null,
    '\n— Filmolog',
  ]
    .filter(Boolean)
    .join('\n');
}

function waitForPosterReady(
  posterUri: string | null,
  posterReadyRef: RefObject<boolean>,
  timeoutMs = 2500,
) {
  if (!posterUri || posterReadyRef.current) {
    return Promise.resolve();
  }

  return new Promise<void>(resolve => {
    const startedAt = Date.now();

    const tick = () => {
      if (posterReadyRef.current || Date.now() - startedAt >= timeoutMs) {
        resolve();
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

function waitForNextFrames(frameCount = 2) {
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

export async function shareReviewAsImage({
  cardRef,
  posterUri,
  posterReadyRef,
  title,
  rating,
  watchedLabel,
  content,
}: ShareReviewImageInput) {
  const message = buildShareMessage({
    title,
    rating,
    watchedLabel,
    content,
  });

  if (!cardRef.current) {
    await Share.open({ message, failOnCancel: false });
    return;
  }

  await waitForPosterReady(posterUri, posterReadyRef);
  await waitForNextFrames();

  const uri = await captureRef(cardRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    width: SHARE_CARD_EXPORT_WIDTH,
    height: SHARE_CARD_EXPORT_HEIGHT,
  });

  await Share.open({
    title: i18n.t('review.detail.shareTitle'),
    message: Platform.OS === 'android' ? message : undefined,
    url: uri,
    type: 'image/png',
    failOnCancel: false,
  });
}

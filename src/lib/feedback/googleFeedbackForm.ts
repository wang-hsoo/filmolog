import { Linking, Platform } from 'react-native';

import { i18n } from '../../i18n';

export type FeedbackFormType = 'feature' | 'bug';

const FEEDBACK_FORM_BASE =
  'https://docs.google.com/forms/d/e/1FAIpQLSeXOZJovH0Q4HFpIyKcIKwtuRJcvFLju_WsoVnNjRpFnygGJg/viewform';

/** Google Form prefill entry IDs (FILMOLOG 의견 보내기) */
const FEEDBACK_FORM_ENTRIES = {
  type: '1388239283',
  version: '1032472826',
  userId: '45843641',
} as const;

function getFeedbackTypeLabel(type: FeedbackFormType) {
  return i18n.t(`settings.support.feedbackForm.${type}`);
}

type BuildFeedbackFormUrlInput = {
  type: FeedbackFormType;
  appVersion: string;
  userId?: string | null;
};

export function buildFeedbackFormUrl({
  type,
  appVersion,
  userId,
}: BuildFeedbackFormUrlInput) {
  const platform = Platform.OS;
  const params = new URLSearchParams({
    usp: 'pp_url',
    [`entry.${FEEDBACK_FORM_ENTRIES.type}`]: getFeedbackTypeLabel(type),
    [`entry.${FEEDBACK_FORM_ENTRIES.version}`]: `${appVersion} (${platform})`,
    [`entry.${FEEDBACK_FORM_ENTRIES.userId}`]:
      userId ?? `guest (${platform})`,
  });

  return `${FEEDBACK_FORM_BASE}?${params.toString()}`;
}

export async function openFeedbackForm(input: BuildFeedbackFormUrlInput) {
  const url = buildFeedbackFormUrl(input);
  const canOpen = await Linking.canOpenURL(url);

  if (!canOpen) {
    throw new Error('[feedback] cannot open Google Form URL');
  }

  await Linking.openURL(url);
}

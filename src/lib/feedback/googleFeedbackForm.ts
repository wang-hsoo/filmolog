import { Linking, Platform } from 'react-native';

export type FeedbackFormType = 'feature' | 'bug';

const FEEDBACK_FORM_BASE =
  'https://docs.google.com/forms/d/e/1FAIpQLSeXOZJovH0Q4HFpIyKcIKwtuRJcvFLju_WsoVnNjRpFnygGJg/viewform';

/** Google Form prefill entry IDs (FILMOLOG 의견 보내기) */
const FEEDBACK_FORM_ENTRIES = {
  type: '1388239283',
  version: '1032472826',
  userId: '45843641',
} as const;

const FEEDBACK_TYPE_LABELS: Record<FeedbackFormType, string> = {
  feature: '기능제안',
  bug: '오류/버그 제보하기',
};

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
    [`entry.${FEEDBACK_FORM_ENTRIES.type}`]: FEEDBACK_TYPE_LABELS[type],
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

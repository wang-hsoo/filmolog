import { Linking } from 'react-native';

export const PRIVACY_POLICY_URL =
  'https://veil-form-0b0.notion.site/Filmolog-c3efb45763398320895a019dc7f8db73';

export const TMDB_WEBSITE_URL = 'https://www.themoviedb.org/';

export async function openExternalUrl(url: string) {
  const canOpen = await Linking.canOpenURL(url);

  if (!canOpen) {
    throw new Error(`[legal] cannot open URL: ${url}`);
  }

  await Linking.openURL(url);
}

export async function openPrivacyPolicy() {
  await openExternalUrl(PRIVACY_POLICY_URL);
}

export async function openTmdbWebsite() {
  await openExternalUrl(TMDB_WEBSITE_URL);
}

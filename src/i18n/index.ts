import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import ko from './locales/ko';
import type { AppLocale } from './types';

export { i18n };

const resources = {
  ko: { translation: ko },
  en: { translation: en },
} as const;

export async function initI18n(locale: AppLocale): Promise<void> {
  if (i18n.isInitialized) {
    await i18n.changeLanguage(locale);
    return;
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });
}

export async function changeAppLocale(locale: AppLocale): Promise<void> {
  await i18n.changeLanguage(locale);
}

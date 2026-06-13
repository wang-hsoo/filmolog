import type { AppLocale } from './types';

const TMDB_LANGUAGE: Record<AppLocale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
};

export function getTmdbLanguage(locale: AppLocale): string {
  return TMDB_LANGUAGE[locale] ?? TMDB_LANGUAGE.ko;
}

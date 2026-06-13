import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

import {
  APP_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from './types';

function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'ko' || value === 'en';
}

function readIntlLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || null;
  } catch {
    return null;
  }
}

function readAndroidLocale(): string | null {
  const fromI18n = NativeModules.I18nManager?.localeIdentifier;
  if (typeof fromI18n === 'string' && fromI18n.length > 0) {
    return fromI18n;
  }

  const platformConstants = NativeModules.PlatformConstants as
    | { Locale?: string; locale?: string }
    | undefined;
  const fromPlatform =
    platformConstants?.Locale ?? platformConstants?.locale ?? null;

  return typeof fromPlatform === 'string' && fromPlatform.length > 0
    ? fromPlatform
    : null;
}

function readIosLocale(): string | null {
  const settings = NativeModules.SettingsManager?.settings as
    | { AppleLocale?: string; AppleLanguages?: string[] }
    | undefined;

  if (typeof settings?.AppleLocale === 'string' && settings.AppleLocale) {
    return settings.AppleLocale;
  }

  const firstLanguage = settings?.AppleLanguages?.[0];
  return typeof firstLanguage === 'string' && firstLanguage.length > 0
    ? firstLanguage
    : null;
}

function toAppLocale(tag: string | null | undefined): AppLocale {
  if (!tag) {
    return DEFAULT_LOCALE;
  }

  const normalized = tag.replace('_', '-').toLowerCase();
  return normalized.startsWith('ko') ? 'ko' : 'en';
}

function getDeviceLocale(): AppLocale {
  const tag =
    Platform.OS === 'ios' ? readIosLocale() : readAndroidLocale();

  return toAppLocale(tag ?? readIntlLocale());
}

export async function loadStoredLocale(): Promise<AppLocale> {
  try {
    const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    if (isAppLocale(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('[i18n] loadStoredLocale failed', error);
  }

  return getDeviceLocale();
}

export async function saveLocale(locale: AppLocale): Promise<void> {
  if (!APP_LOCALES.includes(locale)) {
    return;
  }

  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function getDeviceAppLocale(): AppLocale {
  return getDeviceLocale();
}

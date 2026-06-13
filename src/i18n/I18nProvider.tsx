import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { changeAppLocale, i18n } from './index';
import { saveLocale } from './languageStorage';
import type { AppLocale } from './types';

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export async function setAppLocale(nextLocale: AppLocale) {
  await changeAppLocale(nextLocale);
  await saveLocale(nextLocale);
}

export function useAppLocale() {
  const [locale, setLocaleState] = useState<AppLocale>(
    (i18n.language as AppLocale) ?? 'ko',
  );

  useEffect(() => {
    const handleChange = (lng: string) => {
      setLocaleState(lng as AppLocale);
    };

    i18n.on('languageChanged', handleChange);
    return () => {
      i18n.off('languageChanged', handleChange);
    };
  }, []);

  const setLocale = async (nextLocale: AppLocale) => {
    await setAppLocale(nextLocale);
  };

  return { locale, setLocale, isReady: i18n.isInitialized };
}

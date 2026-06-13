import { initI18n } from '../../../i18n';
import { loadStoredLocale } from '../../../i18n/languageStorage';
import type { BootstrapTask } from '../types';

export const initI18nTask: BootstrapTask = {
  name: 'initI18n',
  run: async () => {
    const locale = await loadStoredLocale();
    await initI18n(locale);
  },
};

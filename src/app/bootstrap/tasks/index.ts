import type { BootstrapTask } from '../types';
import { hydrateAppTask } from './hydrateApp';
import { initI18nTask } from './initI18n';
import { loadFontsTask } from './loadFonts';

export const bootstrapTasks: BootstrapTask[] = [
  loadFontsTask,
  initI18nTask,
  hydrateAppTask,
];

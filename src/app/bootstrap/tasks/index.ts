import type { BootstrapTask } from '../types';
import { hydrateAppTask } from './hydrateApp';
import { loadFontsTask } from './loadFonts';

export const bootstrapTasks: BootstrapTask[] = [loadFontsTask, hydrateAppTask];

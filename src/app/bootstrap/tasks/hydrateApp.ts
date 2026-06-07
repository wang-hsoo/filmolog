import type { BootstrapTask } from '../types';
import { restoreSupabaseSession } from '../../../lib/supabase';

export const hydrateAppTask: BootstrapTask = {
  name: 'hydrateApp',
  run: async () => {
    await restoreSupabaseSession();
  },
};

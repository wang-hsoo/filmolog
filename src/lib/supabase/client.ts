import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, isSupabaseConfigured } from '../../config/env';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      '[supabase] env.local.ts 에 SUPABASE URL / ANON KEY 를 설정하세요.',
    );
  }

  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

/** bootstrap — 저장된 세션 복원 */
export async function restoreSupabaseSession() {
  if (!isSupabaseConfigured()) {
    if (__DEV__) {
      console.warn('[supabase] env 미설정 — 세션 복원 스킵');
    }
    return null;
  }

  const { data, error } = await getSupabaseClient().auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

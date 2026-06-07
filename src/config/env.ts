import { localEnv } from './env.local';

export const env = {
  supabaseUrl: localEnv.supabaseUrl,
  supabaseAnonKey: localEnv.supabaseAnonKey,
  googleClientId: localEnv.googleClientId,
  googleClientIdAndroid: localEnv.googleClientIdAndroid,
  tmdbApiKey: localEnv.tmdbApiKey,
} as const;

export function isSupabaseConfigured() {
  return (
    env.supabaseUrl.length > 0 &&
    env.supabaseAnonKey.length > 0
  );
}

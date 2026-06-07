/** `env.local.ts` 로 복사 후 Supabase Dashboard 값 입력 */
export const localEnv = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  googleClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  googleClientIdAndroid: 'YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com',
} as const;

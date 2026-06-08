import type { Session, User } from '@supabase/supabase-js';

import { getSupabaseClient } from '../client';

/** 로컬 세션 (bootstrap restore 와 동일 소스) */
export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

/**
 * 서버에서 JWT 검증 후 유저 반환 — 화면/API 호출 전 이걸 쓰는 게 안전
 * 로그인 안 됐으면 null
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) {
    throw error;
  }
  return data.user;
}

/** auth.users.id 기준 public.users */
export async function getUserProfile(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/** auth user + public.users 한 번에 */
export async function getCurrentUserWithProfile() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, profile: null };
  }

  const profile = await getUserProfile(user.id);
  return { user, profile };
}

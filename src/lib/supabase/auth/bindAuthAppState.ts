import { AppState, type AppStateStatus } from 'react-native';

import { isSupabaseConfigured } from '../../../config/env';
import { getSupabaseClient } from '../client';

let bound = false;

function handleAppStateChange(nextState: AppStateStatus) {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();

  if (nextState === 'active') {
    supabase.auth.startAutoRefresh();
    void supabase.auth.getSession();
    return;
  }

  supabase.auth.stopAutoRefresh();
}

/** RN: 백그라운드에서 토큰 자동갱신 중지, 포그라운드 복귀 시 재개 */
export function bindSupabaseAuthAppState() {
  if (bound || !isSupabaseConfigured()) {
    return;
  }

  bound = true;
  AppState.addEventListener('change', handleAppStateChange);
  getSupabaseClient().auth.startAutoRefresh();
}

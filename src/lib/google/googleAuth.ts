import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { env } from '../../config/env';

let configured = false;

export function configureGoogleSignIn() {
  if (configured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: env.googleClientId,
    offlineAccess: true,
  });
  configured = true;
}

/** 기기에 캐시된 Google 계정 세션 제거 → 다음 로그인 시 계정 선택 UI 유도 */
export async function signOutGoogleSession() {
  configureGoogleSignIn();

  try {
    await GoogleSignin.signOut();
  } catch {
    // Google에 로그인된 상태가 아니면 무시
  }
}

export async function prepareGoogleAccountPicker() {
  await signOutGoogleSession();
}

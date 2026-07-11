import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { checkAppUpdate, promptAppUpdate } from './checkAppUpdate';

/**
 * 스토어 최신 버전과 비교해 업데이트 팝업.
 * - gap 1: soft (나중에 가능)
 * - gap ≥ FORCE_UPDATE_GAP(2): force (닫기 불가)
 */
function AppUpdateChecker() {
  const checkingRef = useRef(false);
  const softPromptedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const run = async (fromResume: boolean) => {
      if (checkingRef.current) {
        return;
      }

      checkingRef.current = true;

      try {
        const update = await checkAppUpdate();
        if (cancelled || !update) {
          return;
        }

        if (update.force) {
          promptAppUpdate(update);
          return;
        }

        // soft는 세션당 1회 (포그라운드 재진입마다 안 띄움)
        if (!fromResume && !softPromptedRef.current) {
          softPromptedRef.current = true;
          promptAppUpdate(update);
        }
      } finally {
        checkingRef.current = false;
      }
    };

    const timer = setTimeout(() => {
      void run(false);
    }, 900);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void run(true);
      }
    };

    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return null;
}

export default AppUpdateChecker;

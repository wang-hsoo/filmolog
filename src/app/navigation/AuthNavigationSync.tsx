import { useLayoutEffect } from 'react';

import { useAuth } from '../../lib/supabase/auth';

import { resetToAppScreen } from './navigationRef';

export function AuthNavigationSync() {
  const { user, isLoading } = useAuth();

  useLayoutEffect(() => {
    if (isLoading || user) {
      return;
    }

    resetToAppScreen();
  }, [isLoading, user]);

  return null;
}

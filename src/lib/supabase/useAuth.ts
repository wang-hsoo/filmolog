import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { isSupabaseConfigured } from '../../config/env';
import { getSupabaseClient } from './client';

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ user: null, session: null, isLoading: false });
      return;
    }

    const supabase = getSupabaseClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) {
        return;
      }
      if (error) {
        setState({ user: null, session: null, isLoading: false });
        return;
      }
      setState(prev => ({
        ...prev,
        user: data.user,
        isLoading: false,
      }));
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!cancelled) {
          setState({
            user: session?.user ?? null,
            session,
            isLoading: false,
          });
        }
      },
    );

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}

import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from 'styled-components/native';

import { AdBootstrap, ArchiveDialogProvider } from '../components';
import { BadgeUnlockProvider } from '../features/badges';
import { bindSupabaseAuthAppState, useAuth } from '../lib/supabase/auth';
import { navigationTheme } from '../theme';
import { AuthNavigationSync } from './navigation/AuthNavigationSync';
import { rootNavigationRef } from './navigation/navigationRef';
import RootNavigator from './navigation/RootNavigator';
import { queryClient } from '../lib/queryClient';

function MainAppContent() {
  const theme = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    bindSupabaseAuthAppState();
  }, []);

  return (
    <BadgeUnlockProvider userId={user?.id ?? null}>
      <AdBootstrap />
      <ArchiveDialogProvider>
        <NavigationContainer ref={rootNavigationRef} theme={navigationTheme}>
          <AuthNavigationSync />
          <StatusBar
            barStyle={'light-content'}
            backgroundColor={theme.colors.appBackground}
          />
          <RootNavigator />
        </NavigationContainer>
      </ArchiveDialogProvider>
    </BadgeUnlockProvider>
  );
}

export function MainApp() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <MainAppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#070606',
  },
});

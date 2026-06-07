import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from 'styled-components/native';

import { LoginStack, OnboardingStack } from '../features/auth';
import {
  ProfileProvider,
  useProfileContext,
} from '../lib/supabase/ProfileProvider';
import { useAuth } from '../lib/supabase/useAuth';
import { AppScreen } from '../theme';
import { queryClient } from '../lib/queryClient';

function AuthenticatedApp() {
  const safeAreaInsets = useSafeAreaInsets();
  const { isLoading, isOnboardingComplete } = useProfileContext();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isOnboardingComplete) {
    return <OnboardingStack />;
  }

  return (
    <AppScreen
      style={{
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right,
      }}
    />
  );
}

function MainAppContent() {
  const theme = useTheme();
  const { user, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={theme.colors.defaultText} />
      </View>
    );
  }

  if (!user) {
    return <LoginStack />;
  }

  return (
    <ProfileProvider userId={user.id}>
      <AuthenticatedApp />
    </ProfileProvider>
  );
}

export function MainApp() {
  const theme = useTheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
          <StatusBar
            barStyle={'light-content'}
            backgroundColor={theme.colors.appBackground}
          />
          <MainAppContent />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070606',
  },
});

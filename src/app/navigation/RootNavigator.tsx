import { createStackNavigator } from '@react-navigation/stack';
import {
  ActivityIndicator,
  InteractionManager,
  StyleSheet,
} from 'react-native';
import { useEffect, useState } from 'react';

import { LoginScreen, OnboardingFlow } from '../../features/auth';
import {
  ProfileProvider,
  useAuth,
  useProfileContext,
} from '../../lib/supabase';
import { AppScreen, theme } from '../../theme';

import type { RootStackParamList } from './types';
import MainNavigator from './MainNavigator';
import { CollectionScreen } from '../../features/collection';
import { FilmLogScreen } from '../../features/filmLog';

export type { OnboardingStackParamList, RootStackParamList } from './types';

const RootStack = createStackNavigator<RootStackParamList>();

function BootstrapLoader() {
  return (
    <AppScreen style={styles.centered}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
    </AppScreen>
  );
}

function AuthenticatedScreens() {
  const { isLoading, isOnboardingComplete } = useProfileContext();

  if (isLoading) {
    return <BootstrapLoader />;
  }

  if (isOnboardingComplete) {
    return <MainNavigator />;
  }

  return <OnboardingFlow />;
}

function RootShell() {
  const { user, isLoading } = useAuth();
  const [authTransitionReady, setAuthTransitionReady] = useState(!user);

  useEffect(() => {
    if (!user) {
      setAuthTransitionReady(true);
      return;
    }

    setAuthTransitionReady(false);
    const task = InteractionManager.runAfterInteractions(() => {
      setAuthTransitionReady(true);
    });

    return () => task.cancel();
  }, [user?.id]);

  if (isLoading || (user && !authTransitionReady)) {
    return <BootstrapLoader />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <ProfileProvider userId={user.id}>
      <AuthenticatedScreens />
    </ProfileProvider>
  );
}

function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
        cardStyle: { backgroundColor: theme.colors.appBackground },
      }}>
      <RootStack.Screen name="App" component={RootShell} />
      <RootStack.Screen name="Collection" component={CollectionScreen} />
      <RootStack.Screen name="FilmLog" component={FilmLogScreen} />
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RootNavigator;

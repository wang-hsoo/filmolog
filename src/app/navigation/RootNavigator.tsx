import { createStackNavigator } from '@react-navigation/stack';
import {
  ActivityIndicator,
  InteractionManager,
  StyleSheet,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginScreen, OnboardingFlow } from '../../features/auth';
import {
  ProfileProvider,
  useProfileContext,
} from '../../lib/supabase/ProfileProvider';
import { useAuth } from '../../lib/supabase/useAuth';
import { AppScreen } from '../../theme';

import type { RootStackParamList } from './types';

export type { OnboardingStackParamList, RootStackParamList } from './types';

const RootStack = createStackNavigator<RootStackParamList>();

function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();

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

function AuthenticatedScreens() {
  const { isLoading, isOnboardingComplete } = useProfileContext();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isOnboardingComplete) {
    return <HomeScreen />;
  }

  return <OnboardingFlow />;
}

function AuthenticatedGate() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ProfileProvider userId={user.id}>
      <AuthenticatedScreens />
    </ProfileProvider>
  );
}

function RootNavigator() {
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
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="App" component={AuthenticatedGate} />
      ) : (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070606',
  },
});

export default RootNavigator;

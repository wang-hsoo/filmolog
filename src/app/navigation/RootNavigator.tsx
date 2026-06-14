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
import {
  CollectionAddMoviesScreen,
  CollectionDetailScreen,
  CollectionListScreen,
  CollectionScreen,
} from '../../features/collection';
import { FilmLogCompleteScreen, FilmLogScreen } from '../../features/filmLog';
import { MovieDetailScreen } from '../../features/movie';
import ReviewDetailScreen from '../../features/review/components/ReviewDetailScreen';
import ReviewLogListScreen from '../../features/review/components/ReviewLogListScreen';
import ProfileEditScreen from '../../features/profile/components/ProfileEditScreen';
import GenreEditScreen from '../../features/profile/components/GenreEditScreen';
import SettingsScreen from '../../features/profile/components/SettingsScreen';
import WishlistListScreen from '../../features/wishlist/components/WishlistListScreen';
import BadgeListScreen from '../../features/badges/components/BadgeListScreen';

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

  return <AuthenticatedScreens />;
}

function RootNavigator() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const stack = (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
        cardStyle: { backgroundColor: theme.colors.appBackground },
      }}>
      <RootStack.Screen name="App" component={RootShell} />
      <RootStack.Screen name="Collection" component={CollectionScreen} />
      <RootStack.Screen name="CollectionList" component={CollectionListScreen} />
      <RootStack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
      />
      <RootStack.Screen
        name="CollectionAddMovies"
        component={CollectionAddMoviesScreen}
      />
      <RootStack.Screen name="FilmLog" component={FilmLogScreen} />
      <RootStack.Screen
        name="FilmLogComplete"
        component={FilmLogCompleteScreen}
      />
      <RootStack.Screen name="ReviewDetail" component={ReviewDetailScreen} />
      <RootStack.Screen name="ReviewLogList" component={ReviewLogListScreen} />
      <RootStack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
      <RootStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <RootStack.Screen name="GenreEdit" component={GenreEditScreen} />
      <RootStack.Screen name="WishlistList" component={WishlistListScreen} />
      <RootStack.Screen name="BadgeList" component={BadgeListScreen} />
    </RootStack.Navigator>
  );

  if (isAuthLoading) {
    return <BootstrapLoader />;
  }

  return <ProfileProvider userId={user?.id}>{stack}</ProfileProvider>;
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RootNavigator;

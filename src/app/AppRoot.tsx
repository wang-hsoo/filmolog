import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import {
  SplashScreen,
  SPLASH_FADE_OUT_MS,
  SPLASH_MIN_DURATION_MS,
} from '../features/splash';
import { ThemeProvider } from '../theme';
import { runAppBootstrap } from './bootstrap';
import { MainApp } from './MainApp';

type AppPhase = 'splash' | 'exiting' | 'ready';

function AppRootContent() {
  const [phase, setPhase] = useState<AppPhase>('splash');
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const isExiting = useRef(false);

  const startExitTransition = useCallback(() => {
    if (isExiting.current) {
      return;
    }
    isExiting.current = true;
    setPhase('exiting');

    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: SPLASH_FADE_OUT_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setPhase('ready');
      }
    });
  }, [splashOpacity]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      runAppBootstrap(),
      new Promise<void>(resolve =>
        setTimeout(resolve, SPLASH_MIN_DURATION_MS),
      ),
    ])
      .then(() => {
        if (!cancelled) {
          startExitTransition();
        }
      })
      .catch(error => {
        console.error('[AppRoot] bootstrap failed', error);
        if (!cancelled) {
          startExitTransition();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [startExitTransition]);

  const showMain = phase === 'exiting' || phase === 'ready';

  return (
    <View style={styles.root}>
      {showMain ? <MainApp /> : null}
      {phase !== 'ready' ? (
        <Animated.View
          style={[styles.splashOverlay, { opacity: splashOpacity }]}
          pointerEvents={phase === 'exiting' ? 'none' : 'auto'}>
          <SplashScreen />
        </Animated.View>
      ) : null}
    </View>
  );
}

export function AppRoot() {
  return (
    <ThemeProvider>
      <AppRootContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
});

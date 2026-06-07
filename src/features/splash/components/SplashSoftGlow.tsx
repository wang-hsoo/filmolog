import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {
  SPLASH_GLOW_BREATHE_MS,
  SPLASH_GLOW_PAUSE_MS,
  SPLASH_GLOW_SWEEP_MS,
} from '../constants';

const GLOW_COLORS = [
  'transparent',
  'rgba(255, 238, 210, 0.03)',
  'rgba(197, 160, 115, 0.14)',
  'rgba(255, 245, 228, 0.08)',
  'transparent',
];

const GLOW_LOCATIONS = [0, 0.32, 0.5, 0.68, 1];

/** Image를 감싸지 않고 위에만 올림 — Android에서 Animated+Image 조합 깨짐 방지 */
export function SplashSoftGlow() {
  const { width, height } = useWindowDimensions();
  const sweep = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (width <= 0) {
      return;
    }

    sweep.setValue(0);
    breathe.setValue(0);

    const sweepLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: SPLASH_GLOW_SWEEP_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(SPLASH_GLOW_PAUSE_MS),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: SPLASH_GLOW_BREATHE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: SPLASH_GLOW_BREATHE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    sweepLoop.start();
    breatheLoop.start();

    return () => {
      sweepLoop.stop();
      breatheLoop.stop();
    };
  }, [breathe, sweep, width]);

  if (width <= 0 || height <= 0) {
    return null;
  }

  const bandWidth = width * 0.65;
  const travel = width + bandWidth;

  const translateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-bandWidth, travel - bandWidth],
  });

  const beamOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 0.9],
  });

  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.beam,
          {
            width: bandWidth,
            height: height * 1.2,
            opacity: beamOpacity,
            transform: [{ translateX }, { rotate: '12deg' }],
          },
        ]}>
        <LinearGradient
          colors={GLOW_COLORS}
          locations={GLOW_LOCATIONS}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  beam: {
    position: 'absolute',
    top: '-10%',
    left: 0,
  },
});

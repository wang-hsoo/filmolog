import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {
  SPLASH_GLOW_BREATHE_MS,
  SPLASH_GLOW_PAUSE_MS,
  SPLASH_GLOW_SWEEP_MS,
} from '../constants';

/** 따뜻한 크림/골드 — 낮은 채도로만 스침 */
const GLOW_COLORS = [
  'transparent',
  'rgba(255, 238, 210, 0.03)',
  'rgba(197, 160, 115, 0.14)',
  'rgba(255, 245, 228, 0.08)',
  'transparent',
];

const GLOW_LOCATIONS = [0, 0.32, 0.5, 0.68, 1];

type SplashSoftGlowProps = {
  children: ReactNode;
};

export function SplashSoftGlow({ children }: SplashSoftGlowProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const sweep = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setLayout({ width, height });
    }
  };

  useEffect(() => {
    if (layout.width <= 0) {
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
  }, [breathe, layout.width, sweep]);

  const bandWidth = layout.width * 0.65;
  const travel = layout.width + bandWidth;

  const translateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-bandWidth, travel - bandWidth],
  });

  const contentOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        {children}
      </Animated.View>
      {layout.width > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.beam,
            {
              width: bandWidth,
              height: layout.height * 1.2,
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  beam: {
    position: 'absolute',
    top: '-10%',
    left: 0,
    opacity: 0.85,
  },
});

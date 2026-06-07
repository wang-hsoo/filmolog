import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

import { theme } from '../../../theme';
import { SPLASH_IMAGE } from '../constants';
import { SplashSoftGlow } from './SplashSoftGlow';
import { SplashVintageVignette } from './SplashVintageVignette';

export function SplashScreen() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.root, { width, height }]}>
      <Image
        source={SPLASH_IMAGE}
        style={{ width, height }}
        resizeMode="cover"
      />
      <SplashSoftGlow />
      <SplashVintageVignette />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.splashBackground,
  },
});

import { Image, StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';

import { SplashSoftGlow } from './SplashSoftGlow';
import { SplashVintageVignette } from './SplashVintageVignette';

const Root = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.splashBackground};
`;

export function SplashScreen() {
  return (
    <Root>
      <View style={styles.stage}>
        <SplashSoftGlow>
          <Image
            source={require('../../../../assets/splash/splash.png')}
            style={styles.image}
          />
        </SplashSoftGlow>
        <SplashVintageVignette />
      </View>
    </Root>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

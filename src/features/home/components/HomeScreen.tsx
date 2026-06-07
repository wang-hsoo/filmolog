import { Image, StyleSheet, Text } from 'react-native';
import styled from 'styled-components/native';

import { HOME_BANNER_ASPECT_RATIO, HOME_IMAGE } from '../constatns';

function HomeScreen() {
  return (
    <Container>
      <BannerFrame style={{ aspectRatio: HOME_BANNER_ASPECT_RATIO }}>
        <Image source={HOME_IMAGE.home} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      </BannerFrame>
      
    </Container>
  );
}

export default HomeScreen;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.appBackground};
`;

const BannerFrame = styled.View`
  width: 100%;
`;

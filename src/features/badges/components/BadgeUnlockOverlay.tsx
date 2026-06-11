import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';

import type { Badge } from '../../../components/constants/badge.constants';
import { brandLetterSpacing } from '../../../theme/typography';

const AUTO_DISMISS_MS = 4200;
const SPARKLE_COUNT = 6;

type BadgeUnlockOverlayProps = {
  badge: Badge | null;
  onDismiss: () => void;
};

function BadgeUnlockOverlay({ badge, onDismiss }: BadgeUnlockOverlayProps) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.72)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(28)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    Array.from({ length: SPARKLE_COUNT }, () => new Animated.Value(0)),
  ).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isClosing = useRef(false);

  const runEnterAnimation = useCallback(() => {
    backdrop.setValue(0);
    cardScale.setValue(0.72);
    cardOpacity.setValue(0);
    cardTranslateY.setValue(28);
    iconScale.setValue(0.5);
    glowOpacity.setValue(0);
    shimmer.setValue(0);
    sparkleAnims.forEach(value => value.setValue(0));

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(180),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(shimmer, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
      ...sparkleAnims.map((value, index) =>
        Animated.sequence([
          Animated.delay(200 + index * 80),
          Animated.timing(value, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, [
    backdrop,
    cardOpacity,
    cardScale,
    cardTranslateY,
    glowOpacity,
    iconScale,
    shimmer,
    sparkleAnims,
  ]);

  const dismiss = useCallback(() => {
    if (isClosing.current || !badge) {
      return;
    }

    isClosing.current = true;

    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.92,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        isClosing.current = false;
        onDismiss();
      }
    });
  }, [backdrop, badge, cardOpacity, cardScale, onDismiss]);

  useEffect(() => {
    if (!badge) {
      return;
    }

    isClosing.current = false;
    runEnterAnimation();

    dismissTimer.current = setTimeout(dismiss, AUTO_DISMISS_MS);

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
    };
  }, [badge, dismiss, runEnterAnimation]);

  if (!badge) {
    return null;
  }

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  return (
    <Modal transparent visible animationType="none" onRequestClose={dismiss}>
      <OverlayPressable onPress={dismiss}>
        <Backdrop style={{ opacity: backdrop }} />

        <AnimatedCard
          style={{
            opacity: cardOpacity,
            transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
          }}>
          <CardGradient
            colors={['#1A1610', '#0C0B09', '#080807']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <AnimatedGlow style={{ opacity: glowOpacity }}>
              <GlowGradient
                colors={['#B8956B44', '#B8956B00']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
            </AnimatedGlow>

            <SparkleLayer pointerEvents="none">
              {sparkleAnims.map((value, index) => {
                const angle = (index / SPARKLE_COUNT) * Math.PI * 2;
                const radius = 92;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.sparkle,
                      {
                        transform: [
                          { translateX: x },
                          { translateY: y },
                          {
                            scale: value.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 1.2, 0.6],
                            }),
                          },
                        ],
                        opacity: value.interpolate({
                          inputRange: [0, 0.4, 1],
                          outputRange: [0, 1, 0],
                        }),
                      },
                    ]}
                  />
                );
              })}
            </SparkleLayer>

            <Overline>BADGE UNLOCKED</Overline>
            <Title>뱃지 획득!</Title>

            <IconFrame>
              <AnimatedShimmer style={{ opacity: shimmerOpacity }} />
              <AnimatedIconWrap style={{ transform: [{ scale: iconScale }] }}>
                <BadgeImage source={badge.icon} resizeMode="contain" />
              </AnimatedIconWrap>
            </IconFrame>

            <BadgeName>{badge.name}</BadgeName>
            <BadgeDescription>{badge.description}</BadgeDescription>
            <DismissHint>탭하여 닫기</DismissHint>
          </CardGradient>
        </AnimatedCard>
      </OverlayPressable>
    </Modal>
  );
}

export default BadgeUnlockOverlay;

const OverlayPressable = styled(Pressable)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Backdrop = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.82);
`;

const AnimatedCard = styled(Animated.View)`
  width: 100%;
  max-width: 320px;
  border-radius: 16px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const CardGradient = styled(LinearGradient)`
  align-items: center;
  padding: 28px 22px 22px;
  overflow: hidden;
`;

const AnimatedGlow = styled(Animated.View)`
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  height: 180px;
`;

const GlowGradient = styled(LinearGradient)`
  flex: 1;
`;

const SparkleLayer = styled.View`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
`;

const Overline = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: ${brandLetterSpacing}px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const Title = styled.Text`
  margin-top: 6px;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 24px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const IconFrame = styled.View`
  margin-top: 22px;
  margin-bottom: 18px;
  width: 120px;
  height: 120px;
  align-items: center;
  justify-content: center;
  border-radius: 60px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
  overflow: hidden;
`;

const AnimatedShimmer = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const AnimatedIconWrap = styled(Animated.View)`
  width: 88px;
  height: 88px;
  align-items: center;
  justify-content: center;
`;

const BadgeImage = styled(Image)`
  width: 88px;
  height: 88px;
`;

const BadgeName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 20px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldSoft};
  text-align: center;
`;

const BadgeDescription = styled.Text`
  margin-top: 8px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.dashboardText};
  text-align: center;
`;

const DismissHint = styled.Text`
  margin-top: 18px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldDim};
`;

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9C4A0',
  },
});

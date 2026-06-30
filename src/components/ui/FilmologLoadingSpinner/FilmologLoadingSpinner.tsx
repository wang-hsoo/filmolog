import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path, Rect } from 'react-native-svg';
import styled from 'styled-components/native';

const CYCLE_MS = 2400;
const SHIMMER_MS = 1900;
const BREATH_MS = 1800;

type FilmologLoadingSpinnerProps = {
  size?: number;
  showBrand?: boolean;
  showLoadingLabel?: boolean;
  caption?: string;
};

function cornerOpacity(phase: Animated.Value, index: number) {
  const peak = (index + 0.25) / 4;
  const rise = Math.max(0, peak - 0.04);
  const hold = peak + 0.08;
  const fall = Math.min(1, peak + 0.18);

  return phase.interpolate({
    inputRange: [0, rise, peak, hold, fall, 1],
    outputRange: [0.18, 0.18, 1, 1, 0.18, 0.18],
    extrapolate: 'clamp',
  });
}

function FilmologLoadingSpinner({
  size = 96,
  showBrand = true,
  showLoadingLabel = true,
  caption,
}: FilmologLoadingSpinnerProps) {
  const { t } = useTranslation();
  const phase = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const phaseLoop = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: CYCLE_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: SHIMMER_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: BREATH_MS / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: BREATH_MS / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    phaseLoop.start();
    shimmerLoop.start();
    breathLoop.start();

    return () => {
      phaseLoop.stop();
      shimmerLoop.stop();
      breathLoop.stop();
    };
  }, [breath, phase, shimmer]);

  const panelWidth = size * 0.92;
  const posterWidth = size * 0.54;
  const posterHeight = posterWidth / 0.68;
  const mat = Math.max(3, size * 0.032);
  const panelBodyPad = size * 0.1;
  const panelHeight = panelBodyPad * 2 + posterHeight + size * 0.04;
  const perforationSize = Math.max(3, size * 0.028);
  const cornerLen = size * 0.1;
  const cornerStroke = Math.max(1, size * 0.012);
  const iconSize = posterWidth * 0.34;

  const innerLeft = mat;
  const innerTop = mat;
  const innerWidth = posterWidth - mat * 2;
  const innerHeight = posterHeight - mat * 2;

  const shimmerTranslateY = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-innerHeight * 0.3, innerHeight * 0.85],
  });

  const iconOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 0.88],
  });

  const iconScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });

  const cornerOpacities = [
    cornerOpacity(phase, 0),
    cornerOpacity(phase, 1),
    cornerOpacity(phase, 2),
    cornerOpacity(phase, 3),
  ];

  const cornerPaths = [
    `M ${cornerStroke} ${cornerLen} V ${cornerStroke} H ${cornerLen}`,
    `M 0 ${cornerStroke} H ${cornerLen - cornerStroke} V ${cornerLen}`,
    `M ${cornerStroke} 0 V ${cornerLen - cornerStroke} H ${cornerLen}`,
    `M 0 ${cornerLen - cornerStroke} V 0 H ${cornerLen - cornerStroke}`,
  ];

  const cornerPositions = [
    { left: 0, top: 0 },
    { right: 0, top: 0 },
    { left: 0, bottom: 0 },
    { right: 0, bottom: 0 },
  ] as const;

  return (
    <Root>
      <ArchiveShell $width={panelWidth} $height={panelHeight}>
        <PanelAccent />

        <PanelBody $padding={panelBodyPad}>
          <PerforationRow $gap={perforationSize * 2.2}>
            {Array.from({ length: 5 }).map((_, index) => (
              <PerforationHole key={`hole-${index}`} $size={perforationSize} />
            ))}
          </PerforationRow>

          <PosterMat $width={posterWidth} $height={posterHeight} $pad={mat}>
            <Svg width={posterWidth} height={posterHeight}>
              <Rect
                x={0.5}
                y={0.5}
                width={posterWidth - 1}
                height={posterHeight - 1}
                rx={3}
                ry={3}
                fill="#0F0D0B"
                stroke="#4A3D30"
                strokeWidth={1}
              />
              <Rect
                x={innerLeft}
                y={innerTop}
                width={innerWidth}
                height={innerHeight}
                rx={2}
                ry={2}
                fill="#080807"
                stroke="#2E261C"
                strokeWidth={0.5}
              />
            </Svg>

            <PosterStage
              style={{
                left: innerLeft,
                top: innerTop,
                width: innerWidth,
                height: innerHeight,
              }}>
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    width: innerWidth * 0.7,
                    transform: [{ translateY: shimmerTranslateY }],
                  },
                ]}
              />

              <Animated.View
                style={{
                  opacity: iconOpacity,
                  transform: [{ scale: iconScale }],
                }}>
                <Icon name="filmstrip" size={iconSize} color="#8A7052" />
              </Animated.View>
            </PosterStage>

            {cornerOpacities.map((opacity, index) => (
              <CornerMark
                key={`corner-${index}`}
                style={{ ...cornerPositions[index], opacity }}>
                <Svg width={cornerLen} height={cornerLen}>
                  <Path
                    d={cornerPaths[index]}
                    stroke="#D9C4A0"
                    strokeWidth={cornerStroke}
                    fill="none"
                    strokeLinecap="round"
                  />
                </Svg>
              </CornerMark>
            ))}
          </PosterMat>

          <FilmBadgeRow>
            <Icon name="movie-roll" size={perforationSize * 2.6} color="#8A7052" />
            <FilmBadgeLabel>ARCHIVE</FilmBadgeLabel>
          </FilmBadgeRow>
        </PanelBody>
      </ArchiveShell>

      {showBrand ? (
        <BrandBlock>
          <BrandMark>FILMOLOG</BrandMark>
          {showLoadingLabel ? (
            <LoadingLabel>{t('common.loading.spinner')}</LoadingLabel>
          ) : null}
          {caption ? <Caption>{caption}</Caption> : null}
        </BrandBlock>
      ) : caption ? (
        <CaptionOnly>{caption}</CaptionOnly>
      ) : null}
    </Root>
  );
}

export default FilmologLoadingSpinner;

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    left: '15%',
    height: '32%',
    borderRadius: 999,
    backgroundColor: '#B8956B',
    opacity: 0.12,
  },
});

const Root = styled.View`
  align-items: center;
  gap: 14px;
`;

const ArchiveShell = styled.View<{ $width: number; $height: number }>`
  width: ${({ $width }) => $width}px;
  min-height: ${({ $height }) => $height}px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const PanelAccent = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const PanelBody = styled.View<{ $padding: number }>`
  padding: ${({ $padding }) => $padding}px;
  align-items: center;
  gap: 8px;
`;

const PerforationRow = styled.View<{ $gap: number }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ $gap }) => $gap}px;
`;

const PerforationHole = styled.View<{ $size: number }>`
  width: ${({ $size }) => $size * 1.35}px;
  height: ${({ $size }) => $size}px;
  border-radius: 1px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorder};
`;

const PosterMat = styled.View<{
  $width: number;
  $height: number;
  $pad: number;
}>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  position: relative;
`;

const PosterStage = styled.View`
  position: absolute;
  overflow: hidden;
  border-radius: 2px;
  align-items: center;
  justify-content: center;
`;

const CornerMark = styled(Animated.View)`
  position: absolute;
`;

const FilmBadgeRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  opacity: 0.72;
`;

const FilmBadgeLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 8px;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const BrandBlock = styled.View`
  align-items: center;
  gap: 6px;
`;

const BrandMark = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 13px;
  letter-spacing: 5px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const LoadingLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const Caption = styled.Text`
  margin-top: 2px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const CaptionOnly = styled(Caption)`
  margin-top: 0;
`;

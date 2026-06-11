import { Text, TextInput } from 'react-native';

/** 시스템 글자 크기 확대 상한 (1.0 = 기본, 1.3 ≈ 130%) */
export const MAX_FONT_SIZE_MULTIPLIER = 1.3;

type TextDefaults = {
  maxFontSizeMultiplier?: number;
  allowFontScaling?: boolean;
};

/**
 * iOS "더 큰 텍스트" / Android "글자 크기·디스플레이 크기" 대응.
 * - 텍스트는 일정 비율까지만 커지게 제한 (그리드·포스터 레이아웃 보호)
 * - 화면 확대는 RN이 dp 단위로 스케일하므로 flex 기반 레이아웃은 대체로 유지됨
 */
export function configureTextAccessibility() {
  const textDefaults = (Text as { defaultProps?: TextDefaults }).defaultProps ?? {};
  (Text as { defaultProps?: TextDefaults }).defaultProps = {
    ...textDefaults,
    allowFontScaling: true,
    maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
  };

  const inputDefaults =
    (TextInput as { defaultProps?: TextDefaults }).defaultProps ?? {};
  (TextInput as { defaultProps?: TextDefaults }).defaultProps = {
    ...inputDefaults,
    allowFontScaling: true,
    maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
  };
}

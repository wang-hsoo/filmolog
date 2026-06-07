import styled from 'styled-components/native';

const VignetteTop = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 28%;
  background-color: rgba(0, 0, 0, 0.38);
`;

const VignetteBottom = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32%;
  background-color: rgba(0, 0, 0, 0.45);
`;

const VignetteSide = styled.View<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 14%;
  ${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}
  background-color: rgba(0, 0, 0, 0.22);
`;

/** 아날로그 홀 — 가장자리만 살짝 눌러줌 */
export function SplashVintageVignette() {
  return (
    <>
      <VignetteTop pointerEvents="none" />
      <VignetteBottom pointerEvents="none" />
      <VignetteSide $side="left" pointerEvents="none" />
      <VignetteSide $side="right" pointerEvents="none" />
    </>
  );
}

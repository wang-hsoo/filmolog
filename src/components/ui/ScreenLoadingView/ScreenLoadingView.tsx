import styled from 'styled-components/native';

import FilmologLoadingSpinner from '../FilmologLoadingSpinner/FilmologLoadingSpinner';

type ScreenLoadingViewProps = {
  caption?: string;
  /** 패널 없이 스피너만 */
  bare?: boolean;
  size?: number;
  showBrand?: boolean;
  showLoadingLabel?: boolean;
  minHeight?: number;
};

function ScreenLoadingView({
  caption,
  bare = false,
  size = 92,
  showBrand = true,
  showLoadingLabel = true,
  minHeight = 320,
}: ScreenLoadingViewProps) {
  const spinner = (
    <FilmologLoadingSpinner
      size={size}
      showBrand={showBrand}
      showLoadingLabel={showLoadingLabel}
      caption={caption}
    />
  );

  if (bare) {
    return <BareRoot>{spinner}</BareRoot>;
  }

  return (
    <PanelRoot>
      <PanelInner $minHeight={minHeight}>{spinner}</PanelInner>
    </PanelRoot>
  );
}

export default ScreenLoadingView;

const BareRoot = styled.View`
  align-items: center;
  justify-content: center;
  padding: 24px 0;
`;

const PanelRoot = styled.View`
  padding: 0 20px;
`;

const PanelInner = styled.View<{ $minHeight?: number }>`
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 36px 20px 32px;
  min-height: ${({ $minHeight = 320 }) => $minHeight}px;
  align-items: center;
  justify-content: center;
`;

import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Feather';
import styled, { useTheme } from 'styled-components/native';

const H_PAD = 20;

export type HeaderProps = {
  navigation: { goBack: () => void };
  subtitle: string;
  onPressRight?: () => void;
  rightDisabled?: boolean;
  hideRight?: boolean;
  rightIcon?: string;
  rightElement?: ReactNode;
};

function Header({
  navigation,
  subtitle,
  onPressRight,
  rightDisabled = false,
  hideRight = false,
  rightIcon = 'more-horizontal',
  rightElement,
}: HeaderProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const renderRight = () => {
    if (rightElement) {
      return <HeaderSideSlot>{rightElement}</HeaderSideSlot>;
    }

    if (onPressRight) {
      return (
        <HeaderIconButton
          onPress={onPressRight}
          disabled={rightDisabled}
          accessibilityRole="button">
          <Icon
            name={rightIcon}
            size={20}
            color={
              rightDisabled ? theme.colors.goldDim : theme.colors.primary
            }
          />
        </HeaderIconButton>
      );
    }

    if (hideRight) {
      return <HeaderSideSlot />;
    }

    return <HeaderSideSlot />;
  };

  return (
    <HeaderRoot>
      <PageHeader>
        <HeaderIconButton
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.accessibility.back')}>
          <Icon name="arrow-left" size={20} color={theme.colors.primary} />
        </HeaderIconButton>

        <BrandBlock>
          <BrandTitle>FILMOLOG</BrandTitle>
          <BrandSubtitle>{subtitle}</BrandSubtitle>
        </BrandBlock>

        {renderRight()}
      </PageHeader>
      <HeaderRule />
    </HeaderRoot>
  );
}

export default Header;

const HeaderRoot = styled.View`
  width: 100%;
`;

const PageHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 6px ${H_PAD}px 10px;
`;

const HeaderRule = styled.View`
  height: 1px;
  margin: 0 ${H_PAD}px 4px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;

const HeaderSideSlot = styled.View`
  width: 38px;
  height: 38px;
`;

const HeaderIconButton = styled(Pressable)`
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const BrandBlock = styled.View`
  flex: 1;
  align-items: center;
  gap: 3px;
`;

const BrandTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 17px;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const BrandSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 9px;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

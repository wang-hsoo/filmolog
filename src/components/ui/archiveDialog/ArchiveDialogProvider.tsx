import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { Modal, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';

import { registerArchiveDialogHandler } from '../../../lib/dialog/archiveDialog';
import { brandLetterSpacing } from '../../../theme/typography';

import type {
  ArchiveAlertButton,
  ArchiveDialogConfig,
} from './types';

function getOverline(buttons: ArchiveAlertButton[]) {
  const hasDestructive = buttons.some(button => button.style === 'destructive');
  const hasCancel = buttons.some(button => button.style === 'cancel');

  if (hasDestructive && hasCancel) {
    return 'CONFIRM';
  }

  return 'NOTICE';
}

function ArchiveDialogProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<ArchiveDialogConfig | null>(null);

  const close = useCallback((button?: ArchiveAlertButton) => {
    setConfig(null);
    button?.onPress?.();
  }, []);

  const showDialog = useCallback((nextConfig: ArchiveDialogConfig) => {
    setConfig(nextConfig);
  }, []);

  useEffect(() => {
    registerArchiveDialogHandler(showDialog);
    return () => registerArchiveDialogHandler(null);
  }, [showDialog]);

  const buttons = config?.buttons ?? [];
  const overline = config ? getOverline(buttons) : 'NOTICE';

  return (
    <>
      {children}

      <Modal
        transparent
        visible={!!config}
        animationType="fade"
        onRequestClose={() => {
          const cancelButton = buttons.find(button => button.style === 'cancel');
          close(cancelButton);
        }}>
        {config ? (
          <OverlayRoot>
            <BackdropPressable
              onPress={() => {
                const cancelButton = buttons.find(
                  button => button.style === 'cancel',
                );
                if (cancelButton) {
                  close(cancelButton);
                }
              }}
            />

            <DialogCard accessibilityRole="alert">
              <CardGradient
                colors={['#1A1610', '#0C0B09', '#080807']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <AccentLine />
                <Overline>{overline}</Overline>
                <Title>{config.title}</Title>
                {config.message ? (
                  <Message>{config.message}</Message>
                ) : null}

                <ButtonRow $single={buttons.length === 1}>
                  {buttons.map((button, index) => {
                    const isCancel = button.style === 'cancel';
                    const isDestructive = button.style === 'destructive';

                    return (
                      <DialogButton
                        key={`${button.text}-${index}`}
                        onPress={() => close(button)}
                        $single={buttons.length === 1}
                        $cancel={isCancel}
                        $destructive={isDestructive}
                        accessibilityRole="button">
                        <DialogButtonLabel
                          $cancel={isCancel}
                          $destructive={isDestructive}>
                          {button.text}
                        </DialogButtonLabel>
                      </DialogButton>
                    );
                  })}
                </ButtonRow>
              </CardGradient>
            </DialogCard>
          </OverlayRoot>
        ) : null}
      </Modal>
    </>
  );
}

export default ArchiveDialogProvider;

const OverlayRoot = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const BackdropPressable = styled(Pressable)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.82);
`;

const DialogCard = styled.View`
  width: 100%;
  max-width: 320px;
  z-index: 1;
  border-radius: 16px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const CardGradient = styled(LinearGradient)`
  padding: 24px 20px 18px;
  gap: 10px;
`;

const AccentLine = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const Overline = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: ${brandLetterSpacing}px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 20px;
  line-height: 26px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const Message = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 14px;
  line-height: 21px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const ButtonRow = styled.View<{ $single: boolean }>`
  flex-direction: row;
  gap: 10px;
  margin-top: 10px;
  ${({ $single }) => ($single ? 'justify-content: center;' : '')}
`;

const DialogButton = styled(Pressable)<{
  $single: boolean;
  $cancel: boolean;
  $destructive: boolean;
}>`
  flex: ${({ $single }) => ($single ? '0 1 auto' : '1')};
  min-width: ${({ $single }) => ($single ? '120px' : '0')};
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme, $cancel, $destructive }) =>
    $cancel || $destructive
      ? theme.colors.dashborderBorderAccent
      : theme.colors.goldSoft};
  background-color: ${({ theme, $cancel, $destructive }) =>
    $cancel || $destructive ? theme.colors.surface : theme.colors.primary};
`;

const DialogButtonLabel = styled.Text<{
  $cancel: boolean;
  $destructive: boolean;
}>`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 14px;
  letter-spacing: 0.2px;
  color: ${({ theme, $cancel, $destructive }) => {
    if ($cancel || $destructive) {
      return theme.colors.goldDim;
    }

    return theme.colors.appBackground;
  }};
`;

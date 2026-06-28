import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  useWindowDimensions,
  type View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import {
  ArchiveBannerAd,
  ArchiveNativeAd,
  ArchivePanel,
} from '../../../components';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import { AppScreen, theme } from '../../../theme';

import ReviewCalendarShareCard, {
  CALENDAR_SHARE_CARD_HEIGHT,
  CALENDAR_SHARE_CARD_WIDTH,
  type ReviewCalendarShareCardProps,
} from './ReviewCalendarShareCard';
import {
  saveCalendarGalleryImage,
  shareCalendarGalleryImage,
} from '../utils/shareCalendarGallery';

type ReviewCalendarPreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  shareCardProps: ReviewCalendarShareCardProps;
  shareMessage: string;
  monthTitle: string;
};

const H_PAD = 20;

function ReviewCalendarPreviewModal({
  visible,
  onClose,
  shareCardProps,
  shareMessage,
  monthTitle,
}: ReviewCalendarPreviewModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const shareCardRef = useRef<View>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const previewScale = useMemo(() => {
    const maxWidth = windowWidth - H_PAD * 2 - 24;
    return Math.min(maxWidth / CALENDAR_SHARE_CARD_WIDTH, 1);
  }, [windowWidth]);

  const previewFrameHeight = CALENDAR_SHARE_CARD_HEIGHT * previewScale + 8;
  const isBusy = isSaving || isSharing;

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      await saveCalendarGalleryImage(shareCardRef);
      archiveAlert(t('review.calendar.saveImage'), t('review.calendar.saveSuccess'));
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'permission-denied'
          ? t('review.calendar.permissionDenied')
          : t('review.calendar.saveFailed');

      archiveAlert(t('review.calendar.saveImage'), message);
    } finally {
      setIsSaving(false);
    }
  }, [onClose, t]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);

    try {
      await shareCalendarGalleryImage(shareCardRef, shareMessage);
    } catch {
      // 사용자가 공유 시트를 닫은 경우 등은 무시
    } finally {
      setIsSharing(false);
    }
  }, [shareMessage]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <ScreenRoot style={{ paddingTop: insets.top }}>
        <TopBar>
          <CloseButton onPress={onClose} disabled={isBusy}>
            <Icon name="close" size={22} color={theme.colors.dashboardIcon} />
          </CloseButton>
          <TopTitle>{t('review.calendar.previewTitle')}</TopTitle>
          <TopSpacer />
        </TopBar>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: H_PAD,
            paddingBottom: insets.bottom + 108,
          }}>
          <HeroPanel>
            <HeroTitle>{t('review.calendar.previewHeadline')}</HeroTitle>
            <HeroMeta>{monthTitle}</HeroMeta>

            <PreviewFrame $height={previewFrameHeight}>
              <PreviewScaler
                $scale={previewScale}
                $height={CALENDAR_SHARE_CARD_HEIGHT}>
                <ReviewCalendarShareCard
                  ref={shareCardRef}
                  {...shareCardProps}
                />
              </PreviewScaler>
            </PreviewFrame>

            <PreviewHint>{t('review.calendar.previewHint')}</PreviewHint>
          </HeroPanel>

          <AdSection>
            <ArchivePanel>
              <ArchiveNativeAd />
            </ArchivePanel>
            <ArchiveBannerAd />
          </AdSection>
        </ScrollView>

        <FooterBar style={{ paddingBottom: insets.bottom + 12 }}>
          <FooterButton disabled={isBusy} onPress={onClose}>
            <FooterButtonLabel $muted>{t('common.actions.cancel')}</FooterButtonLabel>
          </FooterButton>
          <FooterButton disabled={isBusy} onPress={handleShare}>
            {isSharing ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <Icon
                name="share-variant-outline"
                size={18}
                color={theme.colors.primary}
              />
            )}
            <FooterButtonLabel>{t('review.calendar.shareImage')}</FooterButtonLabel>
          </FooterButton>
          <FooterButton $primary disabled={isBusy} onPress={handleSave}>
            {isSaving ? (
              <ActivityIndicator color={theme.colors.appBackground} size="small" />
            ) : (
              <Icon
                name="download-outline"
                size={18}
                color={theme.colors.appBackground}
              />
            )}
            <FooterButtonLabel $primary>
              {t('review.calendar.saveImage')}
            </FooterButtonLabel>
          </FooterButton>
        </FooterBar>
      </ScreenRoot>
    </Modal>
  );
}

export default ReviewCalendarPreviewModal;

const ScreenRoot = styled(AppScreen)`
  flex: 1;
`;

const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 4px ${H_PAD}px 10px;
`;

const CloseButton = styled.Pressable`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
`;

const TopTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const TopSpacer = styled.View`
  width: 40px;
`;

const HeroPanel = styled.View`
  align-items: center;
  padding: 20px 16px 18px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
  gap: 10px;
`;

const HeroTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 20px;
  letter-spacing: 0.3px;
  text-align: center;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const HeroMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  text-align: center;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const PreviewFrame = styled.View<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  overflow: hidden;
`;

const PreviewScaler = styled.View<{ $scale: number; $height: number }>`
  width: ${CALENDAR_SHARE_CARD_WIDTH}px;
  height: ${({ $height }) => $height}px;
  transform: scale(${({ $scale }) => $scale});
`;

const PreviewHint = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const AdSection = styled.View`
  margin-top: 16px;
  gap: 14px;
`;

const FooterBar = styled.View`
  position: absolute;
  right: ${H_PAD}px;
  bottom: 0;
  left: ${H_PAD}px;
  flex-direction: row;
  gap: 8px;
`;

const FooterButton = styled.Pressable<{ $primary?: boolean }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 48px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme, $primary }) =>
    $primary ? theme.colors.goldSoft : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $primary }) =>
    $primary ? theme.colors.primary : theme.colors.surfaceRaised};
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

const FooterButtonLabel = styled.Text<{ $primary?: boolean; $muted?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 13px;
  color: ${({ theme, $primary, $muted }) =>
    $primary
      ? theme.colors.appBackground
      : $muted
        ? theme.colors.dashboardText
        : theme.colors.goldSoft};
`;

import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { theme } from '../../../theme';

type ReviewCalendarExportBarProps = {
  disabled: boolean;
  isBusy?: boolean;
  onPressSave: () => void;
  onPressShare: () => void;
};

function ReviewCalendarExportBar({
  disabled,
  isBusy = false,
  onPressSave,
  onPressShare,
}: ReviewCalendarExportBarProps) {
  const { t } = useTranslation();
  const canAct = !disabled && !isBusy;

  return (
    <ExportActions>
      <ExportButton disabled={!canAct} onPress={onPressSave}>
        {isBusy ? (
          <ActivityIndicator color={theme.colors.primary} size="small" />
        ) : (
          <Icon
            name="image-outline"
            size={16}
            color={canAct ? theme.colors.primary : theme.colors.goldDim}
          />
        )}
        <ExportButtonLabel $disabled={!canAct}>
          {isBusy ? t('review.calendar.saving') : t('review.calendar.saveImage')}
        </ExportButtonLabel>
      </ExportButton>

      <ExportButton $secondary disabled={!canAct} onPress={onPressShare}>
        <Icon
          name="share-variant-outline"
          size={16}
          color={canAct ? theme.colors.goldBright : theme.colors.goldDim}
        />
        <ExportButtonLabel $disabled={!canAct} $secondary>
          {t('review.calendar.shareImage')}
        </ExportButtonLabel>
      </ExportButton>
    </ExportActions>
  );
}

export default ReviewCalendarExportBar;

const ExportActions = styled.View`
  flex-direction: row;
  gap: 8px;
  padding: 0 20px 14px;
`;

const ExportButton = styled.Pressable<{ $secondary?: boolean }>`
  flex: 1;
  min-height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: ${({ theme }) => theme.radii.poster}px;
  border-width: 1px;
  border-color: ${({ theme, $secondary }) =>
    $secondary ? theme.colors.dashborderBorder : theme.colors.primaryMuted};
  background-color: ${({ theme, $secondary }) =>
    $secondary ? theme.colors.surface : 'rgba(184, 149, 107, 0.08)'};
  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
`;

const ExportButtonLabel = styled.Text<{ $disabled?: boolean; $secondary?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 12px;
  color: ${({ theme, $disabled, $secondary }) => {
    if ($disabled) {
      return theme.colors.goldDim;
    }
    if ($secondary) {
      return theme.colors.goldBright;
    }
    return theme.colors.primary;
  }};
`;

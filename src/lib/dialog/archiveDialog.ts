import { Alert } from 'react-native';

import type {
  ArchiveAlertButton,
  ArchiveDialogConfig,
} from '../../components/ui/archiveDialog/types';
import { i18n } from '../../i18n';

type DialogHandler = (config: ArchiveDialogConfig) => void;

let dialogHandler: DialogHandler | null = null;

export function registerArchiveDialogHandler(handler: DialogHandler | null) {
  dialogHandler = handler;
}

export function archiveAlert(
  title: string,
  message?: string,
  buttons?: ArchiveAlertButton[],
) {
  const resolvedButtons =
    buttons && buttons.length > 0
      ? buttons
      : [
          {
            text: i18n.t('common.actions.confirm'),
            style: 'default' as const,
          },
        ];

  if (dialogHandler) {
    dialogHandler({
      title,
      message: message ?? '',
      buttons: resolvedButtons,
    });
    return;
  }

  Alert.alert(title, message, buttons);
}

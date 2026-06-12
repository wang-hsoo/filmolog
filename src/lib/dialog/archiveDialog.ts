import { Alert } from 'react-native';

import type {
  ArchiveAlertButton,
  ArchiveDialogConfig,
} from '../../components/ui/archiveDialog/types';

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
      : [{ text: '확인', style: 'default' as const }];

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

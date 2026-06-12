export type ArchiveAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type ArchiveAlertButton = {
  text: string;
  style?: ArchiveAlertButtonStyle;
  onPress?: () => void;
};

export type ArchiveDialogConfig = {
  title: string;
  message: string;
  buttons: ArchiveAlertButton[];
};

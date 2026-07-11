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
  /** false면 백드롭/뒤로가기로 닫히지 않음 (강제 업데이트 등) */
  dismissible?: boolean;
};

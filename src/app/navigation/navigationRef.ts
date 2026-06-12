import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const rootNavigationRef =
  createNavigationContainerRef<RootStackParamList>();

export function resetToAppScreen() {
  if (!rootNavigationRef.isReady()) {
    return;
  }

  rootNavigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'App' }],
    }),
  );
}

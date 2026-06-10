import type { BootstrapTask } from '../types';

export const loadFontsTask: BootstrapTask = {
  name: 'loadFonts',
  run: async () => {
    // 커스텀 폰트는 assets/fonts 에서 네이티브 링크됨.
    // 폰트 추가/변경 후: npx react-native-asset && 앱 재빌드
  },
};

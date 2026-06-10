import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { theme } from '../../theme';

type TabCenterButtonProps = {
  isOpen: boolean;
  onPress: () => void;
};

export function TabCenterButton({ isOpen, onPress }: TabCenterButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel={isOpen ? '메뉴 닫기' : '기록 추가'}
      accessibilityState={{ expanded: isOpen }}>
      <View style={[styles.fab, isOpen && styles.fabOpen]}>
        <Feather
          name={isOpen ? 'x' : 'plus'}
          size={26}
          color={theme.colors.whiteText}
        />
      </View>
    </TouchableOpacity>
  );
}

const FAB_SIZE = 52;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.goldSoft,
  },
  fabOpen: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.dashborderBorderAccent,
  },
});

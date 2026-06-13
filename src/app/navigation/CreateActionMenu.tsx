import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { theme } from '../../theme';

type CreateActionMenuProps = {
  visible: boolean;
  tabBarHeight: number;
  onClose: () => void;
  onFilmLog: () => void;
  onCollection: () => void;
};

type CreateActionKey = 'filmLog' | 'collection';

const ACTION_KEYS: CreateActionKey[] = ['filmLog', 'collection'];

const ACTION_ICONS: Record<CreateActionKey, string> = {
  filmLog: 'movie-open',
  collection: 'folder-outline',
};

export function CreateActionMenu({
  visible,
  tabBarHeight,
  onClose,
  onFilmLog,
  onCollection,
}: CreateActionMenuProps) {
  const { t } = useTranslation();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    backdropOpacity.setValue(0);
    actionsOpacity.setValue(0);
    translateY.setValue(12);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(actionsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [actionsOpacity, backdropOpacity, translateY, visible]);

  const handleActionPress = (key: CreateActionKey) => {
    switch (key) {
      case 'filmLog':
        onFilmLog();
        break;
      case 'collection':
        onCollection();
        break;
    }
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Overlay $bottom={tabBarHeight} pointerEvents="box-none">
      <BackdropPressable onPress={onClose}>
        <Backdrop style={{ opacity: backdropOpacity }} />
      </BackdropPressable>

      <Actions
        style={{
          opacity: actionsOpacity,
          transform: [{ translateY }],
        }}
        pointerEvents="box-none">
        {ACTION_KEYS.map(key => (
          <ActionButton key={key} onPress={() => handleActionPress(key)}>
            <Icon
              name={ACTION_ICONS[key]}
              size={32}
              color={theme.colors.primary}
            />
            <ActionButtonColumn>
              <ActionButtonText>
                {t(`tabs.createMenu.${key}.title`)}
              </ActionButtonText>
              <ActionButtonSubText>
                {t(`tabs.createMenu.${key}.subtitle`)}
              </ActionButtonSubText>
            </ActionButtonColumn>
          </ActionButton>
        ))}
      </Actions>
    </Overlay>
  );
}

const Overlay = styled.View<{ $bottom: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: ${({ $bottom }) => $bottom}px;
  z-index: 20;
`;

const BackdropPressable = styled.Pressable`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const Backdrop = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(7, 6, 6, 0.72);
`;

const Actions = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 40px;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.TouchableOpacity`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.actionButtonBorder};
  background-color: ${({ theme }) => theme.colors.actionButtonBackground};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  min-width: 180px;
`;

const ActionButtonColumn = styled.View`
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
`;

const ActionButtonText = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.whiteText};
`;

const ActionButtonSubText = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.dashboardValue};
`;

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useCallback, useState, type ComponentType } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeIcon from 'react-native-vector-icons/Entypo';
import ExploreIcon from 'react-native-vector-icons/Feather';
import StatisticsIcon from 'react-native-vector-icons/SimpleLineIcons';
import ProfileIcon from 'react-native-vector-icons/FontAwesome6';

import { ExploreScreen } from '../../features/explore';
import { HomeScreen } from '../../features/home';
import { ProfileScreen } from '../../features/profile';
import { StatisticsScreen } from '../../features/statistics';
import { AppScreen, theme } from '../../theme';

import { CreateActionMenu } from './CreateActionMenu';
import { TabCenterButton } from './TabCenterButton';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './types';

const Tab = createBottomTabNavigator();

const TAB_BAR_ACTIVE_COLOR = theme.colors.primary;
const TAB_BAR_INACTIVE_COLOR = theme.colors.tabBarInactive;
const TAB_BAR_ICON_LABEL_GAP = 4;
const TAB_BAR_BOTTOM_PADDING = 8;
const TAB_BAR_HEIGHT = 49;
const TAB_ICON_SIZE = 20;

type TabKey = 'Home' | 'Explore' | 'Create' | 'Statistics' | 'Profile';

type TabConfig = {
  key: TabKey;
  name: string;
  component: ComponentType;
  isCenter?: boolean;
};

const screens: TabConfig[] = [
  {
    key: 'Home',
    name: '홈',
    component: HomeScreen,
  },
  {
    key: 'Explore',
    name: '탐색',
    component: ExploreScreen,
  },
  {
    key: 'Create',
    name: 'Create',
    component: () => null,
    isCenter: true,
  },
  {
    key: 'Statistics',
    name: '통계',
    component: StatisticsScreen,
  },
  {
    key: 'Profile',
    name: '마이페이지',
    component: ProfileScreen,
  },
];

function tabBarIcon(key: TabKey, color: string, size: number) {
  switch (key) {
    case 'Home':
      return <HomeIcon name="home" size={size} color={color} />;
    case 'Explore':
      return <ExploreIcon name="compass" size={size} color={color} />;
    case 'Statistics':
      return <StatisticsIcon name="chart" size={size} color={color} />;
    case 'Profile':
      return <ProfileIcon name="user" size={size} color={color} />;
    default:
      return null;
  }
}

function getTabBarHeight(bottomInset: number) {
  return TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_PADDING + bottomInset;
}

function MainNavigator() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const tabBarHeight = getTabBarHeight(insets.bottom);

  const closeCreateMenu = useCallback(() => {
    setIsCreateMenuOpen(false);
  }, []);

  const handleCreatePress = useCallback(() => {
    setIsCreateMenuOpen(prev => !prev);
  }, []);

  const handleFilmLogPress = useCallback(() => {
    closeCreateMenu();
    // TODO: 영화 기록 추가 화면
  }, [closeCreateMenu]);

  const handleCollectionPress = useCallback(() => {
    closeCreateMenu();
    navigation.navigate('Collection');
  }, [closeCreateMenu]);

  return (
    <AppScreen style={{ paddingTop: insets.top }}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: TAB_BAR_ACTIVE_COLOR,
            tabBarInactiveTintColor: TAB_BAR_INACTIVE_COLOR,
            tabBarIconStyle: { marginBottom: TAB_BAR_ICON_LABEL_GAP },
            tabBarLabelStyle: {
              fontFamily: theme.fonts.bodyLight,
              fontSize: 10,
              letterSpacing: 0.4,
              marginBottom: 2,
            },
            tabBarStyle: {
              backgroundColor: theme.colors.tabBarBackground,
              borderTopWidth: 1,
              borderTopColor: theme.colors.tabBarBorder,
              height: tabBarHeight,
              paddingBottom: insets.bottom + TAB_BAR_BOTTOM_PADDING,
            },
            sceneStyle: { backgroundColor: theme.colors.appBackground },
          }}>
          {screens.map(screen => {
            if (screen.isCenter) {
              return (
                <Tab.Screen
                  key={screen.key}
                  name={screen.name}
                  component={screen.component}
                  listeners={{
                    tabPress: event => {
                      event.preventDefault();
                      handleCreatePress();
                    },
                  }}
                  options={{
                    tabBarLabel: () => null,
                    tabBarIcon: () => null,
                    tabBarButton: () => (
                      <TabCenterButton
                        isOpen={isCreateMenuOpen}
                        onPress={handleCreatePress}
                      />
                    ),
                  }}
                />
              );
            }

            return (
              <Tab.Screen
                key={screen.key}
                name={screen.name}
                component={screen.component}
                listeners={{
                  tabPress: () => {
                    if (isCreateMenuOpen) {
                      closeCreateMenu();
                    }
                  },
                }}
                options={{
                  tabBarIcon: ({ color }) =>
                    tabBarIcon(screen.key, color, TAB_ICON_SIZE),
                  tabBarLabel: screen.name,
                }}
              />
            );
          })}
        </Tab.Navigator>

        <CreateActionMenu
          visible={isCreateMenuOpen}
          tabBarHeight={tabBarHeight}
          onClose={closeCreateMenu}
          onFilmLog={handleFilmLogPress}
          onCollection={handleCollectionPress}
        />
      </View>
    </AppScreen>
  );
}

export default MainNavigator;

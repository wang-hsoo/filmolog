
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../../features/home';
import { ExploreScreen } from '../../features/explore';
import { ProfileScreen } from '../../features/profile';
import { StatisticsScreen } from '../../features/statistics';
import { AppScreen, theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const screens = [
    {
        name: 'Home',
        component: HomeScreen,
    },
    {
        name: 'Explore',
        component: ExploreScreen,
    },
    {
        name: 'Profile',
        component: ProfileScreen,
    },
    {
        name: 'Statistics',
        component: StatisticsScreen,
    },
];


function MainNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <AppScreen style={{ paddingTop: insets.top }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: { backgroundColor: theme.colors.tabBarBackground },
                    sceneStyle: { backgroundColor: theme.colors.appBackground },
                }}
            >
                {screens.map((screen) => (
                    <Tab.Screen key={screen.name} name={screen.name} component={screen.component} />
                ))}
            </Tab.Navigator>
        </AppScreen>
    );
}

export default MainNavigator;
import { createStackNavigator } from '@react-navigation/stack';

import GenreScreen from './GenreScreen';
import NickNameScreen from './NickNameScreen';

export type OnboardingRouteName = 'Nickname' | 'Genre';

type OnboardingStackProps = {
  initialRouteName: OnboardingRouteName;
};

const Stack = createStackNavigator();

function OnboardingStack({ initialRouteName }: OnboardingStackProps) {
  return (
    <Stack.Navigator
      key={initialRouteName}
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Nickname" component={NickNameScreen} />
      <Stack.Screen name="Genre" component={GenreScreen} />
    </Stack.Navigator>
  );
}

export default OnboardingStack;

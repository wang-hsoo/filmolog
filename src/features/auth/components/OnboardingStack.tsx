import { createStackNavigator } from '@react-navigation/stack';

import { useProfileContext } from '../../../lib/supabase/ProfileProvider';
import GenreScreen from './GenreScreen';
import NickNameScreen from './NickNameScreen';

const Stack = createStackNavigator();

function OnboardingStack() {
  const { profile } = useProfileContext();
  const initialRouteName = profile?.nickname?.trim() ? 'Genre' : 'Nickname';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Nickname" component={NickNameScreen} />
      <Stack.Screen name="Genre" component={GenreScreen} />
    </Stack.Navigator>
  );
}

export default OnboardingStack;

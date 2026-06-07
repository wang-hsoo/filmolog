import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './LoginScreen';

const Stack = createStackNavigator();

function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default LoginStack;

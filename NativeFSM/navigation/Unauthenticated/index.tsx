import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { LoginScreen } from './views/Login';

const { Navigator, Screen } = createStackNavigator();

export const UnauthenticatedStack = () => {
  return (
    <Navigator>
      <Screen name="Login" component={LoginScreen} />
    </Navigator>
  );
};

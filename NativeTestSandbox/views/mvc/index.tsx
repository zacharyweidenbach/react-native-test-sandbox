import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { MVCListScreen } from './views/MVCListScreen';

const Stack = createStackNavigator();

export const MVCStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MVCList" component={MVCListScreen} />
    </Stack.Navigator>
  );
};

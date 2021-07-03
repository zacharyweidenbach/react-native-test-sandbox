import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { ConventionalListScreen } from './views/ConventionalListScreen';

const Stack = createStackNavigator();

export const ConventionalStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ConventionalList"
        component={ConventionalListScreen}
      />
    </Stack.Navigator>
  );
};

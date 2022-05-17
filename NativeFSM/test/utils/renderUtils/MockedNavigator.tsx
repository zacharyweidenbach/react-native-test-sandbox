import * as React from 'react';
import '@testing-library/jest-native/extend-expect';
import '@testing-library/react-native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
export const MockedNavigator: React.FC<{
  screen: React.ComponentType<any>;
  initialParams?: { [key: string]: any };
}> = ({ screen, initialParams = {} }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MockedScreen"
        component={screen}
        initialParams={initialParams}
      />
    </Stack.Navigator>
  );
};

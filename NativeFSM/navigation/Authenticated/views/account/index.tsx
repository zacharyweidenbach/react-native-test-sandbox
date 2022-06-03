import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TopNavigation, Text } from '@ui-kitten/components';

import { AccountScreen } from './views/AccountScreen';

const Stack = createStackNavigator();

export const AccountStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={() => ({
          header: () => (
            <TopNavigation
              title={(evaProps) => <Text {...evaProps}>Account</Text>}
              alignment="center"
              style={{ height: 100 }}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

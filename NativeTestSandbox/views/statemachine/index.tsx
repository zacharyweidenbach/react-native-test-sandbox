import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TopNavigation, Text } from '@ui-kitten/components';

import { StateMachineListScreen } from './views/StateMachineListScreen';

const Stack = createStackNavigator();

export const StateMachineStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StateMachineList"
        component={StateMachineListScreen}
        options={() => ({
          header: () => (
            <TopNavigation
              title={(evaProps) => (
                <Text {...evaProps}>State Machine List</Text>
              )}
              subtitle={(evaProps) => (
                <Text {...evaProps}>List with State Machine architecture</Text>
              )}
              alignment="center"
              style={{ height: 100 }}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

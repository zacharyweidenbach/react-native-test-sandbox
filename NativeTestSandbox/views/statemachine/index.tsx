import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  TopNavigation,
  Text,
  TopNavigationAction,
  Icon,
} from '@ui-kitten/components';

import { StateMachineListScreen } from './views/StateMachineListScreen';
import { StateMachineDetailsScreen } from './views/StateMachineDetailsScreen';

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
      <Stack.Screen
        name="StateMachineDetails"
        component={StateMachineDetailsScreen}
        options={() => ({
          header: ({ navigation }) => (
            <TopNavigation
              title={(evaProps) => (
                <Text {...evaProps}>State Machine Details</Text>
              )}
              alignment="center"
              style={{ height: 100 }}
              accessoryLeft={() => (
                <TopNavigationAction
                  icon={(props) => (
                    <Icon {...props} name="arrow-back-outline" />
                  )}
                  onPress={() => navigation.goBack()}
                />
              )}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

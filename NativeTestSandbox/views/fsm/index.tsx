import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  TopNavigation,
  Text,
  TopNavigationAction,
  Icon,
} from '@ui-kitten/components';

import { FSMListScreen } from './views/FSMListScreen';
import { FSMDetailsScreen } from './views/FSMDetailsScreen';

const Stack = createStackNavigator();

export const FSMStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FSMList"
        component={FSMListScreen}
        options={() => ({
          header: () => (
            <TopNavigation
              title={(evaProps) => <Text {...evaProps}>FSM List</Text>}
              subtitle={(evaProps) => (
                <Text {...evaProps}>List with FSM architecture</Text>
              )}
              alignment="center"
              style={{ height: 100 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="FSMDetails"
        component={FSMDetailsScreen}
        options={() => ({
          header: ({ navigation }) => (
            <TopNavigation
              title={(evaProps) => <Text {...evaProps}>FSM Details</Text>}
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

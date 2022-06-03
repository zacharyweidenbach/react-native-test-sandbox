import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  TopNavigation,
  Text,
  TopNavigationAction,
  Icon,
} from '@ui-kitten/components';

import { PlayerListScreen } from './views/PlayerListScreen';
import { PlayerDetailsScreen } from './views/PlayerDetailsScreen';

const Stack = createStackNavigator();

export const PlayerListStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PlayerList"
        component={PlayerListScreen}
        options={() => ({
          header: () => (
            <TopNavigation
              title={(evaProps) => <Text {...evaProps}>Player List</Text>}
              subtitle={(evaProps) => (
                <Text {...evaProps}>List of all players</Text>
              )}
              alignment="center"
              style={{ height: 100 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="PlayerDetails"
        component={PlayerDetailsScreen}
        options={() => ({
          header: ({ navigation }) => (
            <TopNavigation
              title={(evaProps) => <Text {...evaProps}>Player Details</Text>}
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

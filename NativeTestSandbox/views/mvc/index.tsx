import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TopNavigation, Text } from '@ui-kitten/components';

import { MVCListScreen } from './views/MVCListScreen';

const Stack = createStackNavigator();

export const MVCStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MVCList"
        component={MVCListScreen}
        options={() => {
          return {
            header: () => (
              <TopNavigation
                title={(evaProps) => <Text {...evaProps}>MVC List</Text>}
                subtitle={(evaProps) => (
                  <Text {...evaProps}>List with MVC react architecture</Text>
                )}
                alignment="center"
                style={{ height: 100 }}
              />
            ),
          };
        }}
      />
    </Stack.Navigator>
  );
};

import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TopNavigation, Text } from '@ui-kitten/components';

import { ConventionalListScreen } from './views/ConventionalListScreen';

const Stack = createStackNavigator();

export const ConventionalStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ConventionalList"
        component={ConventionalListScreen}
        options={() => {
          return {
            header: () => (
              <TopNavigation
                title={(evaProps) => (
                  <Text {...evaProps}>Conventional List</Text>
                )}
                subtitle={(evaProps) => (
                  <Text {...evaProps}>
                    List with conventional react architecture
                  </Text>
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

import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  TopNavigation,
  TopNavigationAction,
  Text,
  Icon,
} from '@ui-kitten/components';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ConventionalListScreen } from './views/ConventionalListScreen';
import { ConventionalDetailsScreen } from './views/ConventionalDetailsScreen';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export const ConventionalStack = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack.Navigator>
        <Stack.Screen
          name="ConventionalList"
          component={ConventionalListScreen}
          options={() => ({
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
          })}
        />
        <Stack.Screen
          name="ConventionalDetails"
          component={ConventionalDetailsScreen}
          options={() => ({
            header: ({ navigation }) => (
              <TopNavigation
                title={(evaProps) => (
                  <Text {...evaProps}>Conventional Details</Text>
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
    </QueryClientProvider>
  );
};

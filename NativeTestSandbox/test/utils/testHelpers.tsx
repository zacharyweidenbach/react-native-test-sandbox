import * as React from 'react';
import '@testing-library/jest-native/extend-expect';
import '@testing-library/react-native';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';

const queryClient = new QueryClient();

const AllTheProviders: React.FC = ({ children }) => {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>{children}</NavigationContainer>
        </QueryClientProvider>
      </ApplicationProvider>
    </>
  );
};

const Stack = createStackNavigator();
export const MockedNavigator: React.FC<{
  screen: React.FC;
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

export const wrappedRender = (ui: JSX.Element, options?: RenderOptions) =>
  render(ui, {
    wrapper: AllTheProviders,
    ...(options || {}),
  });

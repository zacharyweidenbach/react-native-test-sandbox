import React, { FC } from 'react';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  IconRegistry,
  BottomNavigation,
  BottomNavigationTab,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ConventionalStack } from './views/conventional';
import { MVCStack } from './views/mvc';

const { Navigator, Screen } = createBottomTabNavigator();

const BottomTabBar: FC<{ navigation: any; state: any }> = ({
  navigation,
  state,
}) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
  >
    <BottomNavigationTab title="Conventional List" />
    <BottomNavigationTab title="MVC List" />
  </BottomNavigation>
);

const TabNavigator = () => (
  <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
    <Screen name="ConventionalList" component={ConventionalStack} />
    <Screen name="MVCList" component={MVCStack} />
  </Navigator>
);

const App: FC = () => {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </ApplicationProvider>
    </>
  );
};

export default App;

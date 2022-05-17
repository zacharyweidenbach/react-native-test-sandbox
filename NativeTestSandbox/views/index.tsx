import React, { FC } from 'react';
import { BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ConventionalStack } from './conventional';
import { MVCStack } from './mvc';
import { FSMStack } from './fsm';

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
    <BottomNavigationTab title="State Machine List" />
  </BottomNavigation>
);

export const TabNavigator = () => (
  <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
    <Screen name="ConventionalList" component={ConventionalStack} />
    <Screen name="MVCList" component={MVCStack} />
    <Screen name="FSM" component={FSMStack} />
  </Navigator>
);

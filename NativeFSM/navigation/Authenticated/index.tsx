import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { BottomTabBar } from './components/BottomTabBar';

import { PlayerListStack } from './views/playerList';
import { AccountStack } from './views/account';

const { Navigator, Screen } = createBottomTabNavigator();

export const AuthenticatedStack = () => (
  <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
    <Screen name="PlayerList" component={PlayerListStack} />
    <Screen name="Account" component={AccountStack} />
  </Navigator>
);

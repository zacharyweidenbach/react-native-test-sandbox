import React from 'react';
import type { FC } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ConventionalStack } from './views/conventional';
import { MVCStack } from './views/mvc';

const Tab = createBottomTabNavigator();

const App: FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="ConventionalList" component={ConventionalStack} />
        <Tab.Screen name="MVCList" component={MVCStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

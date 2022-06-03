import React, { FC } from 'react';
import { BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';

export const BottomTabBar: FC<{ navigation: any; state: any }> = ({
  navigation,
  state,
}) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
  >
    <BottomNavigationTab title="Player List" />
    <BottomNavigationTab title="Account" />
  </BottomNavigation>
);

import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { UnauthenticatedStack } from './Unauthenticated';
import { AuthenticatedStack } from './Authenticated';
import { usePrimaryMachineContext } from './primaryMachine.provider';

const { Navigator, Screen } = createStackNavigator();

export const RootStack = () => {
  const { isAuthenticated } = usePrimaryMachineContext();
  let MountedScreenStack;

  if (isAuthenticated) {
    MountedScreenStack = (
      <Screen
        name="Authenticated"
        component={AuthenticatedStack}
        options={{ headerShown: false }}
      />
    );
  } else {
    MountedScreenStack = (
      <Screen
        name="Unauthenticated"
        component={UnauthenticatedStack}
        options={{ headerShown: false }}
      />
    );
  }

  return <Navigator>{MountedScreenStack}</Navigator>;
};

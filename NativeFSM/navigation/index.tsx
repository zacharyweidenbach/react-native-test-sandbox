import React, { FC } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { StoreProvider } from '../store/store.provider';
import { PrimaryMachineProvider } from './primaryMachine.provider';
import { RootStack } from './RootStack';
import { TransitionViews } from './TransitionViews';

export const NavigationProvider: FC = () => {
  return (
    <>
      <StoreProvider>
        <PrimaryMachineProvider>
          <TransitionViews>
            <NavigationContainer>
              <RootStack />
            </NavigationContainer>
          </TransitionViews>
        </PrimaryMachineProvider>
      </StoreProvider>
    </>
  );
};

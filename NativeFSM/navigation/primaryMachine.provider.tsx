import React, { FC, createContext, useContext } from 'react';
import { useInterpret, useSelector } from '@xstate/react';

import { primaryMachine } from './primaryMachine';
import { useStoreContext } from '../store/store.provider';

const PrimaryMachineContext = createContext<{
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
}>({} as any);

export const PrimaryMachineProvider: FC = ({ children }) => {
  const { authQuery, playerListQuery, playerDetailQuery } = useStoreContext();
  const primaryService = useInterpret(primaryMachine, {
    services: {
      bootstrap: async () => {
        await authQuery.initializeAsync();
        await playerListQuery.initializeAsync();
        await playerDetailQuery.initializeAsync();
      },
      login: async () => Promise.resolve(null),
      logout: async () => {
        await authQuery.resetAsync();
        await playerListQuery.resetAsync();
        await playerDetailQuery.resetAsync();
      },
    },
    guards: {
      isAuthenticated: () => Boolean(authQuery.getCurrentValue()),
      // isAuthenticated: () => true,
    },
  });

  const isBootstrapping = useSelector(primaryService, (state) =>
    state.matches('bootstrapping'),
  );
  const isLoggingIn = useSelector(primaryService, (state) =>
    state.matches('loggingIn'),
  );
  const isLoggingOut = useSelector(primaryService, (state) =>
    state.matches('loggingOut'),
  );
  const isAuthenticated = useSelector(primaryService, (state) =>
    state.matches('authenticated'),
  );
  const isUnauthenticated = useSelector(primaryService, (state) =>
    state.matches('unauthenticated'),
  );

  return (
    <PrimaryMachineContext.Provider
      value={{
        isBootstrapping,
        isLoggingIn,
        isLoggingOut,
        isAuthenticated,
        isUnauthenticated,
        handleLogin: () => primaryService.send('LOGIN'),
        handleLogout: () => primaryService.send('LOGOUT'),
      }}
    >
      {children}
    </PrimaryMachineContext.Provider>
  );
};

export const usePrimaryMachineContext = () => {
  return useContext(PrimaryMachineContext);
};

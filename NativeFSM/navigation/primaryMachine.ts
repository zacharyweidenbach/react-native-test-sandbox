import { useInterpret, useSelector } from '@xstate/react';
import { createMachine, createSchema } from 'xstate';

import { useStoreContext } from '../store/store.provider';

export const machineConfig = {
  tsTypes: {} as import('./primaryMachine.typegen').Typegen0,
  schema: {
    events: createSchema<{ type: 'LOGIN' | 'LOGOUT' | 'always' }>(),
    services: createSchema<{
      bootstrap: {
        data: any;
      };
      login: {
        data: any;
      };
      logout: {
        data: any;
      };
    }>(),
  },
  id: 'PrimaryMachine',
  context: {},
  initial: 'bootstrapping',
  states: {
    bootstrapping: {
      invoke: {
        src: 'bootstrap',
        onDone: 'checkAuth',
      },
    },
    checkAuth: {
      always: [
        {
          cond: 'isAuthenticated',
          target: 'authenticated',
        },
        {
          target: 'unauthenticated',
        },
      ],
    },
    loggingIn: {
      invoke: {
        src: 'login',
        onDone: 'authenticated',
        onError: 'loggingOut',
      },
    },
    loggingOut: {
      invoke: {
        src: 'logout',
        onDone: 'unauthenticated',
      },
    },
    authenticated: {
      on: { LOGOUT: 'loggingOut' },
    },
    unauthenticated: {
      on: { LOGIN: 'loggingIn' },
    },
  },
};

export const primaryMachine = createMachine(machineConfig);

export const usePrimaryMachine = () => {
  const queryManagers = useStoreContext();
  const primaryService = useInterpret(primaryMachine, {
    services: {
      bootstrap: async () => {
        for (const key of Object.keys(queryManagers)) {
          await queryManagers[
            key as keyof typeof queryManagers
          ].methods.initializeAsync();
        }
      },
      login: async () => Promise.resolve(null),
      logout: async () => {
        for (const key of Object.keys(queryManagers)) {
          await queryManagers[
            key as keyof typeof queryManagers
          ].methods.resetAsync();
        }
      },
    },
    guards: {
      isAuthenticated: () =>
        Boolean(queryManagers.accessToken.methods.getCurrentValue()),
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

  return {
    isBootstrapping,
    isLoggingIn,
    isLoggingOut,
    isAuthenticated,
    isUnauthenticated,
    handleLogin: () => primaryService.send('LOGIN'),
    handleLogout: () => primaryService.send('LOGOUT'),
  };
};

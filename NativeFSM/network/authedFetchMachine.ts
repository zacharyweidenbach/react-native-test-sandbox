import { createMachine, assign } from 'xstate';

export const RETRY_LIMIT = 2;

type Context = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: any;
  retryCount: number;
  result: any;
  error: any;
};

export const defaultContext = {
  path: '',
  method: 'GET' as const,
  body: undefined,
  retryCount: 0,
  result: null,
  error: null,
};

export const authedFetchMachineConfig = {
  tsTypes: {} as import('./authedFetchMachine.typegen').Typegen0,
  schema: {
    context: {} as Context,
    events: {} as { type: 'always' },
    services: {} as {
      fetchService: {
        data: any;
      };
      refreshToken: {
        data: any;
      };
    },
  },
  id: 'fetch',
  context: defaultContext,
  initial: 'fetching',
  states: {
    fetching: {
      entry: 'clearError',
      invoke: {
        src: 'fetchService',
        onDone: {
          target: 'success',
          actions: 'storeResult',
        },
        onError: {
          target: 'fetchError',
          actions: 'storeError',
        },
      },
    },
    fetchError: {
      always: [
        {
          cond: 'isTokenExpired',
          target: 'refreshingToken',
        },
        {
          cond: 'shouldNotRetry',
          target: 'error',
        },
        {
          target: 'fetching',
          actions: 'incrementRetryCount',
        },
      ],
    },
    refreshingToken: {
      invoke: {
        src: 'refreshToken',
        onDone: {
          target: 'fetching',
          actions: 'storeToken',
        },
        onError: {
          target: 'error',
          actions: ['storeError', 'handleLogout'],
        },
      },
    },
    success: { type: 'final' as const },
    error: { type: 'final' as const },
  },
};

export const authedFetchMachine = createMachine(authedFetchMachineConfig, {
  services: {
    fetchService: async (context) => {
      const response = await fetch(`http://localhost:9000/${context.path}`, {
        method: context.method,
        body: context.body,
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        } else {
          const errorResponse = await response.json();
          if (errorResponse.error && errorResponse.error.message) {
            throw new Error(errorResponse.error.message);
          } else {
            throw new Error('Something went wrong');
          }
        }
      } else {
        const items = await response.json();
        return items;
      }
    },
    refreshToken: async () => {
      const response = await fetch('http://localhost:9000/refresh-token', {
        method: 'POST',
      });
      if (response.ok) {
        const token = await response.json();
        return token;
      } else {
        const errorResponse = await response.json();
        if (errorResponse.error && errorResponse.error.message) {
          throw new Error(errorResponse.error.message);
        } else {
          throw new Error('Failed to refresh token.');
        }
      }
    },
  },
  actions: {
    storeResult: assign({
      result: (_, event) => event.data,
    }),
    storeError: assign({
      error: (_, event) => event.data,
    }),
    clearError: assign({
      error: (_context, _event) => null,
    }),
    storeToken: () => {},
    incrementRetryCount: assign({
      retryCount: (context) => context.retryCount + 1,
    }),
    handleLogout: () => {
      // handleLogout();
    },
  },
  guards: {
    isTokenExpired: (context) => context.error.message === 'Unauthorized',
    shouldNotRetry: (context) => context.retryCount === RETRY_LIMIT,
  },
});

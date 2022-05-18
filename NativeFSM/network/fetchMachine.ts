import { createMachine, assign } from 'xstate';

const RETRY_LIMIT = 2;

type RequestOptions = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
};

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

export const fetchMachineConfig = {
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
          actions: ['storeError', 'logout'],
        },
      },
    },
    error: {
      type: 'final' as const,
      data: {
        error: (context: Context) => context.error,
        result: (context: Context) => context.result,
      },
    },
    success: {
      type: 'final' as const,
      data: {
        error: (context: Context) => context.error,
        result: (context: Context) => context.result,
      },
    },
  },
};

export const fetchMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDMwBcDGALAdKzWAlgHZQDEEA9sWDiQG6UDWt+2e62JUCDlGAQzSFqAbQAMAXUSgADpViFh1GSAAeiAEwBOACw4ArAHZd43boAcANnFHtm2wBoQAT0QBaHeJzjNFo+LWOgDMFuLBwQC+kc5suHHcZGAATsmUyTiyADZCyOkAthwERVykvMSMgsrEEtJIIPKK1aoaCDpWPibiBhbBxgCMRkYGwc5uCO79FgY4uqEGVr19VtrL0bGc8ZsAoqnpZKqNSiLELYi6RsE4Rv3B-X4W2iMXRmMe-YM4DiMj4is2-VW6xAcRwyTAyHBsCIpAAKswwMQKNRaHwWCVcODIXAYVB4SxiOVKkITrVDgpjip6q0rP1DAFgppjH4bsEnK5EP0rB0jJpdJpGYCLH5NJojMDQViobj8YiknsMtlcgUMWCIdLuLLCXwqqSpOSmiczghtNMcNp+uFRcFTL17G8EBY6YtxBaDL5dNoAoDojEQMRKBA4KpQQlSAbKadqedNDhpv0evydHZQroHZMhjhFgYDNpwoyjFZLlYJZsMbs0skI81owgDJoOtorHdwnopkYLBZ01MLOam7oeoFhg3+qXilKcZqEVG5BSa6BWryjDgE3nE8NbBEHQn9KLdAmPmzwrTNGP2ClK9WjbXLZ8zHcxeJAsK7N3tNdusEXYFRdyS37QVgABXDAMDgeB6iOed1E5J8ZiLXMBxtT0bW7esV2mZtGU9KwFkZM8sCvKkF05Xt40TUUvVWCw5nTL8rl8awbhzWxuV0X1IiAA */
  createMachine(
    {
      tsTypes: {} as import('./fetchMachine.typegen').Typegen0,
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
      ...fetchMachineConfig,
    },
    {
      services: {
        fetchService: async (context) => {
          const response = await fetch(
            `http://localhost:9000/${context.path}`,
            {
              method: context.method,
              body: context.body,
            },
          );
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
            throw new Error('Failed to refresh token.');
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
        storeToken: () => {},
        incrementRetryCount: assign({
          retryCount: (context) => context.retryCount + 1,
        }),
        logout: () => {},
        clearError: assign({
          error: (_) => null,
        }),
      },
      guards: {
        isTokenExpired: (context) => context.error.message === 'Unauthorized',
        shouldNotRetry: (context) => context.retryCount === RETRY_LIMIT,
      },
    },
  );

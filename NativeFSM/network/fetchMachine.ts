import { createMachine, assign, sendParent } from 'xstate';
import { actionTypes } from 'xstate/lib/actions';

const RETRY_LIMIT = 2;

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
      entry: sendParent((context: Context) => ({
        type: actionTypes.error,
        data: {
          error: context.error,
        },
      })),
    },
    success: {
      type: 'final' as const,
      data: {
        result: (context: Context) => context.result,
      },
    },
  },
};

export const fetchMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDMwBcDGALAdKzWAlgHZQDEEA9sWDiQG6UDWt+2e62JUCDlGAQzSFqAbQAMAXUSgADpViFh1GSAAeiAEwBOACw4ArAHZd43boAcANnFHtm2wBoQAT0QBaHeJzjNFo+LWOgDMFuLBwQC+kc5suHHcZGAATsmUyTiyADZCyOkAthwERVykvMSMgsrEEtJIIPKK1aoaCDpWPibiBhbBxgCMRkYGwc5uCO79FgY4uqEGVr19VtrL0bGc8ZsAoqnpZKqNSiLELYi6RsE4Rv3B-X4W2iMXRmMe-YM4DiMj4is2-VW6xAcRwyTAyHBsCIpAAKswwMQKNRaHwWCVcODIXAYVB4SxiOVKkITrVDgpjip6q0rP1DAFgppjH4bsEnK5EP0rB0jJpdJpGYCLH5NJojMDQViobj8YiknsMtlcgUMWCIdLuLLCXwqqSpOSmiczghtNMcNp+uEIvcblYem8EP0DJovnz+hcdCNuVZojEQMRKBA4KpQQlSAbKadqecXdMnRZ+To7KFdA7JkMcIsDAZtFaxVZLj6-aGdgqI81owhnR1tFY7uE9FMjBYLGmphZzbXdD1AsNNLSJZs1djoZqEVG5BSK6BWryjDgnbmehcDLYIg6nfpRbonR82eFaZpB8UUmlkuWjZXLZ8zHcxeJAsK7G3tNdusFFg-hf3ucf2LAAFcMAwOB4HqI5p3UTkHxmAsc27YJzFWVMOQmJ0XSmBYIj5WssKPYtNgvKkZ05Ds42XUVtGTBNRlQ9wPyuXx-D+G4HG7BZfUiIA */
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

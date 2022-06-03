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

export const authedFetchMachineConfig = {
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

export const authedFetchMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDMwBcDGALAdKzWAlgHZQDEEA9sWDiQG6UDWt+2e62JUCDlGAQzSFqAbQAMAXUSgADpViFh1GSAAeiAEzjxOACziAzAFYAjAE4AbJb17jAdgA0IAJ6IAtJvO7xp+wA5TcT1zf0tjQ3MAXyjnNlx47jIwACcUyhScWQAbIWQMgFsOAmKuUl5iRkFlYglpJBB5RRrVDQQvSxxxewNjfxN7P3sI5zcEd1N-Y31DKct+k0tzRZi4zgT1gFE0jLJVJqURYlbEPXtDHEHDU01-f3MIs6dXD1M-HG0IiPEly19l1YgeI4FJgZCg2BEUgAFWYYGIFGotD4LFKuFB4LgUKgsJYxAqVSERzq+wUhxUDTallMOAcRk0DluV26o0Qpmsl00ek0hk0Fn8t00mnsgOBGIh2Nx8OSO0yOTyhTRILBEu4UvxfGqxKkpOaRxOCFC03MQUMZpug3C-lZCFMxk0Hy5pjOXgi1ksMViIGIlAgcFUwMSpF15OOlNODqmdv83K89mWMZtE3s9hw82Mxm8ZuFlnOHq9ga2spDLXDCHtnSs1yM5j0kwC1pe40m-hw5isdn84n8w001NF62VmMharhYbkZNLoDa9mFODt3j6Z2M3TNNrtekddbMpkMOkM1M0A5KqXSKRL+rLQXewWuwp0d2F5iTFku4jdXe7Qvdx-YsAArhgGBwPADQHFO6hsuIXg4AehgGHc1wukmwqpr4ATiA8kShDYei-lgF4UtObKtlGS5CuY8azHohhJnBXR+F2UyBNcJqelEQA */
  createMachine(
    {
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
      ...authedFetchMachineConfig,
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
    },
  );

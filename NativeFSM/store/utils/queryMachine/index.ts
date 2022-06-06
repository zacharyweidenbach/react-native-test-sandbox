import { assign, createMachine } from 'xstate';

import { addMinutes, isPast } from 'date-fns';

export type ColdStorage<T> = {
  data: T;
  updatedAt: number;
};

export type Options = {
  id: string;
  query: any;
  staleTime: number;
  emitHandler: {
    emitInitialized: () => void;
    emitLoading: () => void;
    emitSuccess: () => void;
    emitError: () => void;
    emitReset: () => void;
  };
};

export const queryMachineFactory = <ResultType>(options: Options) =>
  createMachine(
    {
      id: options.id,
      initial: 'inactive',
      context: {
        error: null as Error | null,
        updatedAt: null as number | null,
        result: null as ResultType | null,
      },
      states: {
        inactive: {
          on: {
            INITIALIZE: {
              target: 'idle',
            },
          },
          exit: ['notifyInitialized'],
        },
        idle: {
          on: {
            QUERY: 'querying',
            FORCE_QUERY: 'querying',
            RESET: {
              target: 'idle',
              actions: ['clearResult', 'clearError', 'notifyReset'],
            },
          },
        },
        querying: {
          entry: 'notifyLoading',
          invoke: {
            src: options.query,
            onDone: {
              target: 'success',
              actions: ['storeResult', 'clearError'],
            },
            onError: {
              target: 'error',
              actions: ['storeError'],
            },
          },
        },
        success: {
          entry: 'notifySuccess',
          on: {
            QUERY: 'reevaluateResult',
            FORCE_QUERY: 'querying',
            RESET: {
              target: 'idle',
              actions: ['clearResult', 'clearError', 'notifyReset'],
            },
          },
        },
        error: {
          entry: 'notifyError',
          on: {
            QUERY: 'querying',
            FORCE_QUERY: 'querying',
            RESET: {
              target: 'idle',
              actions: ['clearResult', 'clearError', 'notifyReset'],
            },
          },
        },
        reevaluateResult: {
          always: [
            {
              cond: 'hasStaleResult',
              target: 'querying',
            },
            { target: 'success' },
          ],
        },
      },
    },
    {
      actions: {
        storeResult: assign({
          result: (_, event) =>
            (event as unknown as { data: ResultType }).data ?? null,
          updatedAt: (_) => new Date().getTime(),
        }),
        clearResult: assign({
          result: (_) => null,
          updatedAt: (_) => null,
        }),
        storeError: assign({
          error: (_, event) => (event as unknown as { data: Error }).data,
        }),
        clearError: assign({
          error: (_context, _event) => null,
        }),
        notifyInitialized: () => options.emitHandler.emitInitialized(),
        notifyLoading: () => options.emitHandler.emitLoading(),
        notifySuccess: () => options.emitHandler.emitSuccess(),
        notifyError: () => options.emitHandler.emitError(),
        notifyReset: () => options.emitHandler.emitReset(),
      },
      guards: {
        hasStaleResult: (context) => {
          if (context.updatedAt) {
            return isPast(addMinutes(context.updatedAt, options.staleTime));
          } else {
            return false;
          }
        },
      },
    },
  );

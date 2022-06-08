import { assign, createMachine, send } from 'xstate';

import { addMinutes, isPast } from 'date-fns';

export type Config = {
  id: string;
  query: any;
  staleTime: number;
  eventPrefix: string;
  eventSubscriber: {
    id: string;
    src: any;
  };
};

export const queryMachineFactory = <ResultType>(config: Config) =>
  createMachine(
    {
      id: config.id,
      initial: 'inactive',
      context: {
        error: null as Error | null,
        updatedAt: null as number | null,
        result: null as ResultType | null,
      },
      invoke: config.eventSubscriber,
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
            src: config.query,
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
        notifyInitialized: send(
          { type: `${config.eventPrefix}.INITIALIZED` },
          { to: config.eventSubscriber.id },
        ),
        notifyLoading: send(
          { type: `${config.eventPrefix}.LOADING` },
          { to: config.eventSubscriber.id },
        ),
        notifySuccess: send(
          { type: `${config.eventPrefix}.SUCCESS` },
          { to: config.eventSubscriber.id },
        ),
        notifyError: send(
          { type: `${config.eventPrefix}.ERROR` },
          { to: config.eventSubscriber.id },
        ),
        notifyReset: send(
          { type: `${config.eventPrefix}.RESET` },
          { to: config.eventSubscriber.id },
        ),
      },
      guards: {
        hasStaleResult: (context) => {
          if (context.updatedAt) {
            return isPast(addMinutes(context.updatedAt, config.staleTime));
          } else {
            return false;
          }
        },
      },
    },
  );

import { assign, createMachine, send } from 'xstate';

import { StoreRepository } from '../StoreRepository/getStoreRepository';
import { addMinutes, isPast } from 'date-fns';

export type ColdStorage<T> = {
  data: T;
  updatedAt: number;
};

export type Config = {
  storeRepository: StoreRepository;
  id: string;
  storageKey: string;
  query: any;
  staleTime: number;
  eventPrefix: string;
  eventBusConfig: {
    id: string;
    src: any;
  };
};

export const queryMachineWithColdStoreFactory = <ResultType>(config: Config) =>
  createMachine(
    {
      id: config.id,
      initial: 'inactive',
      context: {
        error: null as Error | null,
        updatedAt: null as number | null,
        result: null as ResultType | null,
      },
      invoke: config.eventBusConfig,
      states: {
        inactive: {
          on: {
            INITIALIZE: 'initializing',
          },
        },
        initializing: {
          invoke: {
            src: 'rehydrateFromStorage',
            onDone: {
              target: 'evaluateRehydratedResult',
              actions: ['storeColdStorageResult', 'notifyInitialized'],
            },
          },
        },
        evaluateRehydratedResult: {
          always: [
            {
              cond: 'hasStaleResult',
              target: 'clearingStorage',
              actions: ['clearResult', 'clearError'],
            },
            {
              cond: 'hasResult',
              target: 'success',
            },
            { target: 'idle' },
          ],
        },
        clearingStorage: {
          invoke: {
            src: 'clearStorage',
            onDone: 'idle',
          },
        },
        updatingStorage: {
          invoke: {
            src: 'updateStorage',
            onDone: 'success',
          },
        },
        idle: {
          on: {
            QUERY: 'querying',
            FORCE_QUERY: 'querying',
            RESET: {
              target: 'clearingStorage',
              actions: ['clearResult', 'clearError', 'notifyReset'],
            },
          },
        },
        querying: {
          entry: 'notifyLoading',
          invoke: {
            src: config.query,
            onDone: {
              target: 'updatingStorage',
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
              target: 'clearingStorage',
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
              target: 'clearingStorage',
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
      services: {
        rehydrateFromStorage: async () =>
          config.storeRepository.get(config.storageKey),
        clearStorage: async () =>
          config.storeRepository.remove(config.storageKey),
        updateStorage: async (context) =>
          config.storeRepository.set(config.storageKey, {
            data: context.result,
            updatedAt: context.updatedAt,
          }),
      },
      actions: {
        storeColdStorageResult: assign({
          result: (_, event) =>
            (event as unknown as { data: ColdStorage<ResultType> }).data
              ?.data ?? null,
          updatedAt: (_, event) =>
            (event as unknown as { data: ColdStorage<ResultType> }).data
              ?.updatedAt ?? null,
        }),
        storeResult: assign({
          result: (_, event) =>
            (event as unknown as { data: { result: ResultType } }).data
              ?.result ?? null,
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
          { to: config.eventBusConfig.id },
        ),
        notifyLoading: send(
          { type: `${config.eventPrefix}.LOADING` },
          { to: config.eventBusConfig.id },
        ),
        notifySuccess: send(
          { type: `${config.eventPrefix}.SUCCESS` },
          { to: config.eventBusConfig.id },
        ),
        notifyError: send(
          { type: `${config.eventPrefix}.ERROR` },
          { to: config.eventBusConfig.id },
        ),
        notifyReset: send(
          { type: `${config.eventPrefix}.RESET` },
          { to: config.eventBusConfig.id },
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
        hasResult: (context) => Boolean(context.result),
      },
    },
  );

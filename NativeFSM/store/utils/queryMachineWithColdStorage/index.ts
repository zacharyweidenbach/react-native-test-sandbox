import { assign, createMachine } from 'xstate';

import { StoreRepository } from '../StoreRepository/getStoreRepository';
import { addMinutes, isPast } from 'date-fns';

export type ColdStorage<T> = {
  data: T;
  updatedAt: number;
};

export type Options = {
  storeRepository: StoreRepository;
  id: string;
  storageKey: string;
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

export const queryMachineWithColdStoreFactory = <ResultType>(
  options: Options,
) =>
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
            src: options.query,
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
          options.storeRepository.get(options.storageKey),
        clearStorage: async () =>
          options.storeRepository.remove(options.storageKey),
        updateStorage: async (context) =>
          options.storeRepository.set(options.storageKey, {
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
        hasResult: (context) => Boolean(context.result),
      },
    },
  );

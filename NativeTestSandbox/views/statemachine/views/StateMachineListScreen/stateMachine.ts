import { createMachine, assign } from 'xstate';

import { Item } from '../../../../types';

export const fetchState = {
  id: 'StateMachineListScreen',
  context: { result: [] },
  initial: 'idle',
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      invoke: {
        src: 'fetchService',
        onDone: {
          target: 'evaluateResult',
          actions: 'storeResult',
        },
        onError: 'error',
      },
    },
    evaluateResult: {
      always: [
        { target: 'successWithContent', cond: 'hasContent' },
        { target: 'successNoContent' },
      ],
    },
    successWithContent: { type: 'final' as const },
    successNoContent: { type: 'final' as const },
    error: { type: 'final' as const },
  },
};

export const fetchMachine = createMachine(
  {
    tsTypes: {} as import('./stateMachine.typegen').Typegen0,
    schema: {
      context: {} as { result: Item[] },
      events: {} as { type: 'FETCH' | 'always' },
      services: {} as {
        fetchService: {
          data: Item[];
        };
      },
    },
    ...fetchState,
  },
  {
    services: {
      fetchService: async () => {
        const response = await fetch('http://localhost:9000/items');
        if (response.ok) {
          const items = await response.json();
          return items;
        } else {
          throw new Error('Failed to fetch items.');
        }
      },
    },
    actions: {
      storeResult: assign({
        result: (_, event) => event.data,
      }),
    },
    guards: {
      hasContent: (context) => context.result.length > 0,
    },
  },
);

import { createMachine, assign } from 'xstate';

import { Item } from '../../../../types';

export const fetchMachine = createMachine(
  {
    tsTypes: {} as import('./stateMachine.typegen').Typegen0,
    schema: {
      context: {} as { result: Item[] },
      events: {} as { type: 'FETCH' },
      services: {} as {
        fetchService: {
          data: Item[];
        };
      },
    },
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
            target: 'success',
            actions: 'storeResult',
          },
          onError: 'error',
        },
      },
      success: {},
      error: {},
    },
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
        result: (_, event) => {
          return event.data;
        },
      }),
    },
  },
);

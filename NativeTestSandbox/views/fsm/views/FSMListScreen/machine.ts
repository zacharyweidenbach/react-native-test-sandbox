import { createMachine, assign } from 'xstate';

import { Item } from '../../../../types';

export const machineConfig = {
  id: 'FSMListScreen',
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

export const FSMListScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDEDKBZAMgS1gF1QGMAnMMAOwDpsIAbMAYmQFEAVAYQAlFQAHAe1jY82fuR4gAHogBMARgAclAMwBWAJwKFAFgAMqmcoDsANm0mANCACeiOXN2VVuk2YXrt2hzO0yAvn5WaFi4BCRkVLT8AIYQ2ORQDBBiYNTkAG78ANapwTj4RKQUlFGx8VAI8ZmE0SJiANq6ALoSAkJ14khSiMomcpQyCsraCkY66vIu2la2CDKqSgq6csoKgytGY-6BIHmhhRElMXEJDGDExPzElLy0tQBmVwC2lHsF4cWlJxVV-DUdjRaXTawlEnVA0gQvRklDGwzWRl6yjkRnUMzsnkochMMnUJlRJgUclU8ICQQw+TCRSoYHS0VoAFdamAAEpwBm0PAMVqCUFiCSQ0zqSjaZS6RFGVQmXTKZTydEIOTqYW4oxeVTEhYuUYBHbkfgQOASN5Uw40eg89pggWIDyULRjPojYn2MYKhzaSi6FyuXSeIkOdSqMm7Cn7D6RY7lS188HdBB4ygmdTLZM+IO4qUK+SevReHFyQbqNWikMmg7FWn0pl4Vnszkxjo2hCqIz9GSTcYeFGF7Nt+3LZTqFF9YYyoxlsPvamUWAMwiEOCwADqwgAFuwxLXyHhG9aupDlTDjH7zHLlSZW9mh5QU142+LL70zJOQtPDnOF0uAHL8Tc7ihd2BXkmwPW1NC9dxFBGeYgzbbNE1RNVei0KVvQUV9KQrGkLiuPd+TAxU-SMEVz20ZwNTVQZ3WMJMcWLDwjHkPo8Uw8NqXwuNBUcB0FCdIkNRRBQFWRL0XCMb1xTFXENl1PwgA */
  createMachine(
    {
      tsTypes: {} as import('./machine.typegen').Typegen0,
      schema: {
        context: {} as { result: Item[] },
        events: {} as { type: 'FETCH' | 'always' },
        services: {} as {
          fetchService: {
            data: Item[];
          };
        },
      },
      ...machineConfig,
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

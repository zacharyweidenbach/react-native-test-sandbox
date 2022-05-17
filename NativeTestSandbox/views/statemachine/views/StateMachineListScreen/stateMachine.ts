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

export const fetchMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUAuBDVYCy6DGAFgJYB2YAMkbKsngE5hgkB0REANmAMQBiAogBUAwgAlEoAA4B7WEVREpJcSAAeiAEwBWACzMADAA4AnOqPbtAZguajFgOyaANCACeiAIwA2Pc20G7fprqFp5B6trqAL6RzmiYOPjEZJTUtAxMzOxS6BCkUFwQimCsJABuUgDWxXFYuISkFFQ09IwsWTl5CKTleJgKJADaegC6ytKy8orKagjaXswGOhZGdkbui3NOrohWFswORjaeIZ5mRnra0bEYtYkNKc3pbdm5JPlgdHRSdMwS7JgAM2+AFtmDUEvVkk00q1Mi9Ot0pL1JoMRmMZHJ+tNEHMDMxrOZwnZPO51OoDM43AgtHiLOpPH4LnoSe47Ho7FcQOC6klGqkWhkwKV0OwAK7xABKcFF7FQXHREyxSFUiAMencCy0pgM6j0ZlC7kpO3VzC0RlC9MMxIMFmiMRAJCkEDgym5dyh-KerA4YAVmKmypm7mWzB0lnc7iCFksDiNCEjmlDxiM5qsdmMzKi9rdkL5j1h7VeUD9KOx8fOzE8NuZJOOFn8Ojj9KMpqOwV1qc0mk5Od5DxhguFYsl0tlJaVoBm3kTpPC7j1mmMAS2VOjnn2Rz0mgs7m0mgjWeu8R592hApYsFFeDwcFgAHU5AQhIosCRUOOA5OPHof74DAz-HpewDD3OM6XUBYjBAlNvD0aMyVtbMbghPszy9S9r1vAA5KRnzfJh32VcZ-SUQNv2ZU0ty0Ow7EjaxG22BBljxA4SQudQAjg-8e2Qk8PXzQVPm+D9SK-eMt0THRzgMdYwhTJt901Bk1jWdUtE8Hjj3dPMB1EkBiNLMj40jUNzB3SNghjFdVQgmwf13YILHVbQVjtSIgA */
  createMachine(
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

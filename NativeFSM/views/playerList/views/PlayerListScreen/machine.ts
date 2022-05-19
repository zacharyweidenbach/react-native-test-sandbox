import { createMachine, assign } from 'xstate';

import { Item } from '../../../../types';
import { fetchMachine, defaultContext } from '../../../../network/fetchMachine';

export const machineConfig = {
  id: 'PlayerListScreen',
  context: { result: [], error: null },
  initial: 'idle',
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      initial: 'fetching',
      states: {
        fetching: {
          invoke: {
            id: 'fetchMachine',
            src: fetchMachine.withContext({ ...defaultContext, path: 'items' }),
            onDone: {
              target: 'evaluateResult',
              actions: 'storeResult',
            },
            onError: {
              target: '#PlayerListScreen.error',
              actions: 'storeError',
            },
          },
        },
        evaluateResult: {
          always: [
            {
              target: '#PlayerListScreen.successWithContent',
              cond: 'hasContent',
            },
            { target: '#PlayerListScreen.successNoContent' },
          ],
        },
      },
    },
    successWithContent: { type: 'final' as const },
    successNoContent: { type: 'final' as const },
    error: { type: 'final' as const },
  },
};

export const PlayerListScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAUA2BDAnmATgGQEtYAXAZQGMcwwA7AOgIlTAGIAxAUQBUBhACUSgADgHtYBYgRE1BIAB6IAjAFYAbHWUAWZQAZNAZgCc2-YoBMygDQhMSzYY0AOQ4dX6zbx6tWLNAXz9rNCxcQhIKKlo6VBF0CAIaKDoAMzBicgALBKgWCGkwBhoANxEAawLU9IyAWXRMhLBZUXFJaVkFBE1VBzN9HUd9e1UdQ30AdisbJQm6fSNXZUczHVMLAKCMbHwiMkpqehi47LowIvRUAFd0YjAAJTgL1GIWJrEJKRkkeURHLzpNMZjDyjZRjTSKRSqay2BBmcx0AYuVSLZarZQBQIgGgiCBwWTBLZhXaReiMZivFofdqITRmaF2TR0bpmTQGRwA5GqNaYgmhHYRfbRWLxRIpNL1RIU95tL4dPo6Og6cz9IYjcaTGGQ5ROJEolbmdE8zZ88J7KKHEVJU7nK43e6wR7EKWtT6gDreRx0QyKAZq1wA8H0hA+hzGFlg-TI3ps9YgXnbU0koVHSVfZrS13fWFjdRK5bs1xqiZBwxmHWGZSKCaGRyg7yx+NEgVRB3kchwWAAdQkGR40huNCdabeLupnTpU1hEP+jjBs7Gpdcs8NGxCCeJgtb7dgsAAciI+4PaEPhCOqbKaROYWYxp6zEsAToxvqLDpVA3jevm-RcDgRDhnXPN1EG9RR-kBYF9FBcFISDEMvVpANI2UaN9EcD81ybM1M3TUcL2DRw4IcRYXHGbpjB0e9FAxPwgA */
  createMachine(
    {
      tsTypes: {} as import('./machine.typegen').Typegen0,
      schema: {
        context: {} as { result: Item[]; error: any },
        events: {} as { type: 'FETCH' | 'always' },
      },
      ...machineConfig,
    },
    {
      actions: {
        storeResult: assign({
          result: (_, event) =>
            (event.data as { result: Item[]; error: any }).result,
        }),
        storeError: assign({
          error: (_, event) =>
            (event.data as { result: Item[]; error: any }).error,
        }),
      },
      guards: {
        hasContent: (context) => context.result.length > 0,
      },
    },
  );

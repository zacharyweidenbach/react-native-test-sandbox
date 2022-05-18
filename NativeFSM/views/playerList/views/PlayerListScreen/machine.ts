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
          },
        },
        evaluateResult: {
          always: [
            {
              target: '#PlayerListScreen.error',
              cond: 'hasError',
            },
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
  /** @xstate-layout N4IgpgJg5mDOIC5QAUA2BDAnmATgGQEtYAXAZQGMcwwA7AOgIlTAGIAxAUQBUBhACUSgADgHtYBYgRE1BIAB6IAjAFYAbHWUAWTQE4AHACYdigAwrVB5QBoQmRAct1NBgMwuDAdkWLNHv6pcAX0CbNCxcQhIKKlo6VBF0CAIaKDoAMzBicgALZKgWCGkwBhoANxEAa2Kw7HwiMkpqenjEvPTMnLyEZPLydElpAG0TAF1ZUXEBmSR5ex0dJxMvVRMDPVVlE00Ta1tEZw86Uxc9Dz09ZQvFFx1g0IxayIaY5oSklPas3JSWXBwRHB0IQYYhpAEAWzoNQi9WiTTibzaGS+XR6Ij6U2GYxmEwkUmmoAUCBcJhMdB0SxUykUHhcqm8mhsdmJqnUrJcHgMqj0mjcJgudxA0LqUUasRa71SYFK6FQAFd+mAAEpwOWoYgscZiPHSWREjw7DQ8-Q6TSKc6aCxM-aWugrE4eAKrEyqDzKIKCmgiCBwWTCp5w2KMZhayb4vX7AzWhAOMnKSx6E4GRT0zSXTSC-2wsWvVofZGdFKhnUE2YIDbks2mRO8vSknS7Zkcw7nVTbRM7TamZSZh4w0UvBF5qUy+WKlWwNXEYtTCMIXQuI4GNPKZQeU36LaMvbz7ZHEwnU51laOna98Ii57wiV5GfhmZEs2V7z8ly1+uNxAkzR0VtvtSWNoJzno82aDpO5DkHAsAAOoSNkPDSMQtDTji2qzg+iAUuoBprKsDgLm40aWnodoulStZcvyIH9lesQQVBsCwAAciIiE0MhHF3rqmEIMYBhOMmWhLAYJg6MuHjRloP7HHom4uOaqY0Zegb0H8ALcaWRI6PSdCOu69aWl4ZjRnSZIphyJxvrSNIuspAY5ppc40s+1ZvicH7Rj4hzxpcgEqM4gXBMEQA */
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
          error: (_, event) =>
            (event.data as { result: Item[]; error: any }).error,
        }),
      },
      guards: {
        hasContent: (context) => context.result.length > 0,
        hasError: (context) => context.error !== null,
      },
    },
  );

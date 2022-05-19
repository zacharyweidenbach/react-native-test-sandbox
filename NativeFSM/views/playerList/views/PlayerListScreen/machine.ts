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
  /** @xstate-layout N4IgpgJg5mDOIC5QAUA2BDAnmATgGQEtYAXAZQGMcwwA7AOgIlTAGIAxAUQBUBhACUSgADgHtYBYgRE1BIAB6IAjADZFdABwBWACwAGAJwB2Rds2H1ugEwBmADQhMS7Ybqb9uq9sv73ly14BfAPs0LFxCEgoqWjpUEXQIAhooOgAzMGJyAAskqBYIaTAGGgA3EQBrIvTMrIBZdGyksFlRcUlpWQUES2VNOm8-SwtNazMe+0cEa3VLOn0ba11lRfV1a2UbIJCMbHwiMkpqejiE3LSMxuSWXBwRHDohDGJUu4Bbc5r6y+akEFaJKQyX5dHrKOiGeaDfR6ZQQ-SaCaIIZ9AwebzaRSKfSKTSKLYgUK7CIHaLHeKJZJ0MAldCoACu6GIYAASnA6ahiCwWmIAR1gYhlEY6KNlMpdIZ1qKloZEVNNLo6F5rKNdBjDF4MUFgiAaCIIHBZITwvsokcGEwfsIee0gaAuqZ+tZTKt1MpnF5FOtZSY1KjdKMLItFvprPijXtIocYicKSlqpcoNy2oDOgKFcZFD0MSN1DjerLvGDDJpRepjNZFLoscowztjZHSbFyWdqbSGUzWbB2cQk7zbfJEM41CplV4RqY3MpZdZ4XMFjjLCWZ+ptLWwhGSWaY7lezbU1Mi5iszjpnmEQ4kTZwSXBbozL1-SM10STVH6F3yOQ4LAAOoSLI8NITI0D2vz-Hu-IIPM1gaGWozwioIb6NOEp0KoWjqgY2iitoq7auGxKmjEH5frAsAAHIiIBIG0KBVrJnydqIPM+hoUsmKZjmlg4rKuEuNB0wQsqqhOs+9abjENx3LuKaQUY6hzNo+gun4p4mAWyl0H62GqloIaaGJG5Ef24GyUxCCZuCR5uieuYlto6iysoCl+jO-haCYZZagEQA */
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

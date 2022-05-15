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
          target: 'checkResult',
          actions: 'storeResult',
        },
        onError: 'error',
      },
    },
    checkResult: {
      on: {
        always: [
          { target: 'successWithContent', cond: 'hasContent' },
          { target: 'successNoContent' },
        ],
      },
    },
    successWithContent: { type: 'final' as const },
    successNoContent: { type: 'final' as const },
    error: { type: 'final' as const },
  },
};

export const fetchMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUAuBDVYCy6DGAFgJYB2YAMkbKsngE5hgkB0REANmAMQBiAogBUAwgAlEoAA4B7WEVREpJcSAAeiAIwBWAGzNNAFn0BOABwAmI+oAMW7Wc0AaEAE9EZ-bouabVkwHZ1MxMTK30AXzCnNEwcfGIySmpaBiZmdil0CFIoZkIwPABrACU4AFd2VC50dgB3dGd4JBBpWXlFZTUEbRMAZmZ3C1MTTTMtTT8nVwQzAP6jby1TfXUQv3DIkGisXEJSCioaekYWdMzsrghFMFYSADcpAuut2N2Eg+TjtIyskigEUnueEwChIAG0rABdZQtOQgjpuExGZjBEzdbpGZZmLGTNzqfRzBY9fQzPxEnomCJRDDbOJ7RKHFInb7nMB0OhSOjMCTsTAAMw5AFtmM8dvF9kkjqlTj8-gCpEC2mDIdCZLD2k1Ot0+gMjEMRmMJi43GZtfMfP5AsFQhENiQpBA4MoRbS3hLGawOGAVa04RrEMScdNlswekY-Pqw2ZtDp7JTNtSXmL6R8pczfrkCPlimUKt61Uo-Qh9CFmEZQj1wyERiFtIapliTMiwxG-FGY5o487XuKGZ9pdk84r4dNo8jgmjEZjsUaEH5G14bESSWSKRsu0n3pKWLBSng8HBYAB1OQEISKLAkVCD32gTrjQPRvpz+xGZf6CsdtcJ0V0zfund7geAByUhnpeTBXk0MJDoWAYzj0vjMOor7eMW5gmIEn5UjEP6ur2qSsuydDXuqt6ILWgaaKipb+AYwRBJhnbfi6PYpgWkiqjBZEICslEElYPTqD0DZUaSPQ2mEQA */
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
        hasContent: (context) => Boolean(context.result.length),
      },
    },
  );

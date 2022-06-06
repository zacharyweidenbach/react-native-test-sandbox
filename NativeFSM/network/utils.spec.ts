import {
  createMachine,
  interpret,
  assign,
  DoneInvokeEvent,
  Action,
} from 'xstate';
import nock from 'nock';

import { getAuthedFetchService, fetchPromiseFromFetchService } from './utils';

const getFetchMachineTestHarness = (fetchService: any) =>
  createMachine({
    id: 'test',
    context: { args: [], error: null, result: null } as {
      args: any;
      error: any;
      result: null;
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          START: 'testing',
        },
      },
      testing: {
        invoke: {
          src: fetchService,
          onDone: {
            target: 'success',
            actions: assign({
              result: (_, event) => (event as any).data,
            }) as unknown as Action<
              { args: any; error: any; result: any },
              DoneInvokeEvent<any>
            >[],
          },
          onError: {
            target: 'error',
            actions: assign({
              error: (_, event) => (event as any).data,
            }) as unknown as Action<
              { args: any; error: any; result: any },
              DoneInvokeEvent<any>
            >[],
          },
        },
      },
      success: { type: 'final' as const },
      error: { type: 'final' as const },
    },
  });

describe('network utils', () => {
  afterEach(async () => {
    nock.cleanAll();
  });

  it('should fetch', async (done) => {
    nock('http://localhost:9000')
      .get('/test/someDynamicPath')
      .reply(200, { test: 'test' });
    const fetchService = (
      _context: any,
      event: { path: string; body: any },
    ) => {
      return fetchPromiseFromFetchService(
        getAuthedFetchService({
          path: event.path,
          method: 'GET',
        }),
      );
    };

    const fetchMachineTestHarness = getFetchMachineTestHarness(fetchService);
    const fetchServiceTestHarness = interpret(fetchMachineTestHarness);

    fetchServiceTestHarness.onTransition((state) => {
      if (state.matches('success')) {
        expect(state.context.result).toEqual({ test: 'test' });
        done();
      }
    });

    fetchServiceTestHarness.start();
    fetchServiceTestHarness.send('START', { path: 'test/someDynamicPath' });
  });

  it('should error', async (done) => {
    nock('http://localhost:9000')
      .persist()
      .get('/test/someDynamicPath')
      .reply(500, { error: { message: 'Oh no! An error!' } });
    const fetchService = (
      _context: any,
      event: { path: string; body: any },
    ) => {
      return fetchPromiseFromFetchService(
        getAuthedFetchService({
          path: event.path,
          method: 'GET',
        }),
      );
    };

    const fetchMachineTestHarness = getFetchMachineTestHarness(fetchService);
    const fetchServiceTestHarness = interpret(fetchMachineTestHarness);

    fetchServiceTestHarness.onTransition((state) => {
      if (state.matches('error')) {
        expect(state.context.error).toEqual(new Error('Oh no! An error!'));
        done();
      }
    });

    fetchServiceTestHarness.start();
    fetchServiceTestHarness.send('START', { path: 'test/someDynamicPath' });
  });
});

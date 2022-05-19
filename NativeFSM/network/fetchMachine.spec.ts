import {
  createMachine,
  interpret,
  assign,
  DoneInvokeEvent,
  Action,
} from 'xstate';
import nock from 'nock';

import { fetchMachine, defaultContext } from './fetchMachine';

const getTestMachineHarness = (fetchMachine: any) =>
  createMachine({
    id: 'test',
    context: { error: null },
    initial: 'testing',
    states: {
      testing: {
        invoke: {
          src: fetchMachine,
          onDone: 'done',
          onError: {
            actions: assign({
              error: (_, event) => (event as any).data.error,
            }) as unknown as Action<{ error: null }, DoneInvokeEvent<any>>[],
            target: 'error',
          },
        },
      },
      done: { type: 'final' as const },
      error: { type: 'final' as const },
    },
  });

describe('fetchMachine', () => {
  afterEach(async () => {
    nock.cleanAll();
  });

  it('should eventually reach fetching', (done) => {
    nock('http://localhost:9000').get('/test').reply(200, { test: 'test' });
    const fetchService = interpret(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    ).onTransition((state) => {
      if (state.matches('fetching')) {
        done();
      }
    });

    fetchService.start();
  });

  it('should eventually reach success', (done) => {
    const spyFn = jest.fn();
    nock('http://localhost:9000')
      .get('/test')
      .reply(200, () => {
        spyFn();
        return { test: 'test' };
      });

    const fetchService = interpret(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    ).onTransition((state) => {
      if (state.matches('success')) {
        expect(spyFn).toHaveBeenCalledTimes(1);
        expect(state.context.result).toEqual({ test: 'test' });
        done();
      }
    });

    fetchService.start();
  });

  it('should eventually reach error and have retried', (done) => {
    const spyFn = jest.fn();
    nock('http://localhost:9000')
      .persist()
      .get('/test')
      .reply(500, () => {
        spyFn();
        return { error: { message: 'Oh no! An error!' } };
      });

    const fetchMachineTestHarness = getTestMachineHarness(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    );

    const fetchService = interpret(fetchMachineTestHarness).onTransition(
      (state) => {
        if (state.matches('error')) {
          expect(spyFn).toHaveBeenCalledTimes(3);
          expect((state.context.error as unknown as Error).message).toEqual(
            'Oh no! An error!',
          );
          done();
        }
      },
    );

    fetchService.start();
  });

  it('should eventually reach error and use default error', (done) => {
    const spyFn = jest.fn();
    nock('http://localhost:9000')
      .persist()
      .get('/test')
      .reply(500, () => {
        spyFn();
        return {};
      });

    const fetchMachineTestHarness = getTestMachineHarness(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    );

    const fetchService = interpret(fetchMachineTestHarness).onTransition(
      (state) => {
        if (state.matches('error')) {
          expect(spyFn).toHaveBeenCalledTimes(3);
          expect((state.context.error as unknown as Error).message).toEqual(
            'Something went wrong',
          );
          done();
        }
      },
    );

    fetchService.start();
  });

  it('should eventually reach error after failed refresh token try', (done) => {
    const spyFnIntendedEndpoint = jest.fn();
    const spyFnRefreshEndpoint = jest.fn();

    nock('http://localhost:9000')
      .get('/test')
      .reply(401, () => {
        spyFnIntendedEndpoint();
        return {};
      });

    nock('http://localhost:9000')
      .post('/refresh-token')
      .reply(500, () => {
        spyFnRefreshEndpoint();
        return { error: { message: 'Failed to refresh.' } };
      });

    const fetchMachineTestHarness = getTestMachineHarness(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    );

    const fetchService = interpret(fetchMachineTestHarness).onTransition(
      (state) => {
        if (state.matches('error')) {
          expect(spyFnIntendedEndpoint).toHaveBeenCalledTimes(1);
          expect(spyFnRefreshEndpoint).toHaveBeenCalledTimes(1);
          expect((state.context.error as unknown as Error).message).toEqual(
            'Failed to refresh.',
          );
          done();
        }
      },
    );

    fetchService.start();
  });
});

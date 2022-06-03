import { createMachine, interpret } from 'xstate';
import nock from 'nock';

import { itemBuilder } from '../../../test/mocks/item';
import { getQueryServiceMethods } from '../../utils/getQueryServiceMethods';
import { StoreInterface } from '../../utils/StoreRepository/StoreInterface';
import { eventStreamFactory } from '../eventStreamFactory';
import { Item } from '../../../types';
import { queryMachineWithColdStoreFactory } from '.';
import { storeRepository } from '../StoreRepository';
import { defaultContext, fetchMachine } from '../../../network/fetchMachine';
import { subscriptionMachineFactory } from '../subscriptionMachineFactory';

const TEST_STORE_KEY = 'test';
const TEST_STALE_TIME = 30;

type Test = Item[];

const events = {
  INITIALIZED: 'TEST.INITIALIZED',
  LOADING: 'TEST.LOADING',
  SUCCESS: 'TEST.SUCCESS',
  ERROR: 'TEST.ERROR',
  RESET: 'TEST.RESET',
};

const testEventStreamHandler = eventStreamFactory(events);

const testQueryMachine = queryMachineWithColdStoreFactory<Test>({
  storeRepository,
  id: 'testQueryMachine',
  storageKey: TEST_STORE_KEY,
  query: fetchMachine.withContext({ ...defaultContext, path: 'items' }),
  staleTime: TEST_STALE_TIME,
  emitHandler: testEventStreamHandler,
});

const testSubscriptionMachine = subscriptionMachineFactory({
  id: 'testSubscriptionMachine',
  events,
  eventStream: testEventStreamHandler.eventStream,
});

const UIMachine = createMachine({
  id: 'UIMachine',
  type: 'parallel',
  states: {
    local: {
      initial: 'idle',
      states: {
        idle: {
          on: { START: 'loading' },
        },
        loading: {
          invoke: {
            src: 'queryAsync',
            onDone: 'success',
            onError: 'error',
          },
          on: {
            SUCCESS: 'success',
          },
        },
        success: {},
        error: {},
      },
    },
    query: {
      invoke: testSubscriptionMachine,
    },
  },
  on: { [events.RESET]: 'local.idle' },
});

describe('subscription', () => {
  afterEach(async () => {
    nock.cleanAll();
    await StoreInterface.removeItem(TEST_STORE_KEY);
  });

  it('should wait until data is fetched before transitioning to success', async (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);

    const testQueryService = interpret(testQueryMachine);
    const { initializeAsync, queryAsync, getCurrentValue } =
      getQueryServiceMethods(testQueryService);

    testQueryService.start();
    await initializeAsync();

    const UIServer = interpret(
      UIMachine.withConfig({ services: { queryAsync } }),
    );

    UIServer.onTransition((state) => {
      if (state.matches('local.success')) {
        expect(getCurrentValue()).toEqual([item]);
        done();
      }
    });

    UIServer.start();
    UIServer.send('START');
  });

  it('should wait until data is fetched before transitioning to error', async (done) => {
    nock('http://localhost:9000')
      .persist()
      .get('/items')
      .reply(500, { error: { message: 'Something went wrong' } });

    const testQueryService = interpret(testQueryMachine);
    const { initializeAsync, queryAsync } =
      getQueryServiceMethods<Test>(testQueryService);

    testQueryService.start();
    await initializeAsync();

    const UIServer = interpret(
      UIMachine.withConfig({ services: { queryAsync } }),
    );

    UIServer.onTransition((state) => {
      if (state.matches('local.error')) {
        done();
      }
    });

    UIServer.start();
    UIServer.send('START');
  });

  it('should detect a reset', async (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);

    const testQueryService = interpret(testQueryMachine);
    const { initializeAsync, queryAsync, reset, getCurrentValue } =
      getQueryServiceMethods<Test>(testQueryService);

    testQueryService.start();
    await initializeAsync();

    const UIServer = interpret(
      UIMachine.withConfig({ services: { queryAsync } }),
    );

    let hasSucceededBefore = false;
    UIServer.onTransition((state) => {
      if (state.matches('local.success')) {
        hasSucceededBefore = true;
        reset();
      }

      if (state.matches('local.idle') && hasSucceededBefore) {
        expect(getCurrentValue()).toBeNull();
        done();
      }
    });

    UIServer.start();
    UIServer.send('START');
  });
});

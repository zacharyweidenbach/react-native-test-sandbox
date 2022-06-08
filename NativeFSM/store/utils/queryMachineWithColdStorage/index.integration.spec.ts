import { createMachine, interpret } from 'xstate';
import nock from 'nock';

import { itemBuilder } from '../../../test/mocks/item';
import { getQueryServiceMethods } from '../../utils/getQueryServiceMethods';
import { StoreInterface } from '../../utils/StoreRepository/StoreInterface';
import { Item } from '../../../types';
import { queryMachineWithColdStoreFactory } from '.';
import { storeRepository } from '../StoreRepository';
import { defaultContext, fetchMachine } from '../../../network/fetchMachine';
import { EventBus } from '../../../utils/xstate/EventBus';
import { fromEventBus } from '../../../utils/xstate/fromEventBus';

const TEST_STORE_KEY = 'test';
const TEST_STALE_TIME = 30;

type Test = Item[];

const getTestMachines = () => {
  const ID = 'TEST';
  const eventBus = new EventBus('EV');
  const testEventBusConfig = {
    id: ID,
    src: fromEventBus(() => eventBus),
  };

  const testQueryMachine = queryMachineWithColdStoreFactory<Test, undefined>({
    storeRepository,
    id: 'testQueryMachine',
    storageKey: TEST_STORE_KEY,
    query: fetchMachine.withContext({ ...defaultContext, path: 'items' }),
    staleTime: TEST_STALE_TIME,
    eventPrefix: ID,
    eventSubscriber: testEventBusConfig,
  });

  const UIMachine = createMachine({
    id: 'UIMachine',
    invoke: testEventBusConfig,
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
    on: { [`${ID}.RESET`]: 'idle' },
  });

  return { testQueryMachine, UIMachine };
};

describe('subscription', () => {
  afterEach(async () => {
    nock.cleanAll();
    await StoreInterface.removeItem(TEST_STORE_KEY);
  });

  it('should wait until data is fetched before transitioning to success', async (done) => {
    const { testQueryMachine, UIMachine } = getTestMachines();
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
      if (state.matches('success')) {
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

    const { testQueryMachine, UIMachine } = getTestMachines();
    const testQueryService = interpret(testQueryMachine);
    const { initializeAsync, queryAsync } = getQueryServiceMethods<
      Test,
      undefined
    >(testQueryService);

    testQueryService.start();
    await initializeAsync();

    const UIServer = interpret(
      UIMachine.withConfig({ services: { queryAsync: () => queryAsync() } }),
    );

    UIServer.onTransition((state) => {
      if (state.matches('error')) {
        done();
      }
    });

    UIServer.start();
    UIServer.send('START');
  });

  it('should detect a reset', async (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);

    const { testQueryMachine, UIMachine } = getTestMachines();
    const testQueryService = interpret(testQueryMachine);
    const { initializeAsync, queryAsync, reset, getCurrentValue } =
      getQueryServiceMethods<Test, undefined>(testQueryService);

    testQueryService.start();
    await initializeAsync();

    const UIServer = interpret(
      UIMachine.withConfig({ services: { queryAsync: () => queryAsync() } }),
    );

    let hasSucceededBefore = false;
    UIServer.onTransition((state) => {
      if (state.matches('success')) {
        hasSucceededBefore = true;
        reset();
      }

      if (state.matches('idle') && hasSucceededBefore) {
        expect(getCurrentValue()).toBeNull();
        done();
      }
    });

    UIServer.start();
    UIServer.send('START');
  });
});

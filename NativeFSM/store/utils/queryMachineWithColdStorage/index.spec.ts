import { interpret } from 'xstate';
import { subMinutes } from 'date-fns';
import nock from 'nock';
import { isEqual } from 'lodash';

import { fetchMachine, defaultContext } from '../../../network/fetchMachine';
import { Item } from '../../../types';
import { itemBuilder } from '../../../test/mocks/item';
import { getMockStoreRepository } from '../../utils/StoreRepository/index.mock';
import { queryMachineWithColdStoreFactory } from '.';

type Test = Item[];

const STALE_TIME_IN_MINUTES = 30;
const TEST_KEY = 'test';

const getTestQueryService = (
  mockStoreRepository: ReturnType<typeof getMockStoreRepository>,
) => {
  return interpret(
    queryMachineWithColdStoreFactory<Test>({
      storeRepository: mockStoreRepository,
      id: 'testQueryMachine',
      storageKey: TEST_KEY,
      query: fetchMachine.withContext({ ...defaultContext, path: 'items' }),
      staleTime: STALE_TIME_IN_MINUTES,
      emitHandler: {
        emitInitialized: () => {},
        emitLoading: () => {},
        emitSuccess: () => {},
        emitError: () => {},
        emitReset: () => {},
      },
    }),
  );
};

describe('queryMachineWithColdStoreFactory', () => {
  afterEach(async () => {
    nock.cleanAll();
  });
  it('should initialize and become idle', (done) => {
    const mockStoreRepository = getMockStoreRepository();
    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition((state) => {
      if (state.matches('idle')) {
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should go to success with cached data', async (done) => {
    const mockStoreRepository = getMockStoreRepository();
    const itemList = [itemBuilder()];
    const now = new Date().getTime();

    const testColdStorage = {
      data: itemList,
      updatedAt: now,
    };

    await mockStoreRepository.set(TEST_KEY, testColdStorage);

    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition(async (state) => {
      if (state.matches('success')) {
        expect(state.context.result).toEqual(itemList);
        expect(state.context.updatedAt).toEqual(now);
        expect(await mockStoreRepository.get(TEST_KEY)).toEqual(
          testColdStorage,
        );
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should go to idle with stale cached data', async (done) => {
    const mockStoreRepository = getMockStoreRepository();

    const testColdStorage = {
      data: [itemBuilder()],
      updatedAt: subMinutes(new Date(), STALE_TIME_IN_MINUTES + 1).getTime(),
    };

    await mockStoreRepository.set(TEST_KEY, testColdStorage);

    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition(async (state) => {
      if (state.matches('idle')) {
        expect(state.context.updatedAt).toBeNull();
        expect(state.context.result).toBeNull();
        expect(await mockStoreRepository.get(TEST_KEY)).toBeUndefined();
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should fetch data and put in storage', (done) => {
    const mockStoreRepository = getMockStoreRepository();
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);
    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition(async (state) => {
      if (state.matches('idle')) {
        testQueryService.send('QUERY');
      }

      if (state.matches('success')) {
        expect(state.context.result).toEqual([item]);
        expect((await mockStoreRepository.get(TEST_KEY)).data).toEqual([item]);
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should fetch data and handle errors', (done) => {
    const mockStoreRepository = getMockStoreRepository();
    nock('http://localhost:9000')
      .persist()
      .get('/items')
      .reply(500, { error: { message: 'Something went wrong' } });
    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition(async (state) => {
      if (state.matches('idle')) {
        testQueryService.send('QUERY');
      }

      if (state.matches('error')) {
        expect(state.context.error).toEqual({
          error: new Error('Something went wrong'),
        });
        expect(await mockStoreRepository.get(TEST_KEY)).toBeUndefined();
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should recover from an error', (done) => {
    const item = itemBuilder();
    const mockStoreRepository = getMockStoreRepository();
    nock('http://localhost:9000')
      .persist()
      .get('/items')
      .reply(500, { error: { message: 'Something went wrong' } });
    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition(async (state) => {
      if (state.matches('idle')) {
        testQueryService.send('QUERY');
      }

      if (state.matches('error')) {
        nock.cleanAll();
        nock('http://localhost:9000')
          .persist()
          .get('/items')
          .reply(200, [item]);

        testQueryService.send('QUERY');
      }

      if (state.matches('success')) {
        expect(state.context.result).toEqual([item]);
        expect((await mockStoreRepository.get(TEST_KEY)).data).toEqual([item]);
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should force a new query', async (done) => {
    const mockStoreRepository = getMockStoreRepository();
    const oldItemList = [itemBuilder()];
    const newItemList = [itemBuilder()];
    const now = new Date().getTime();

    const testColdStorage = {
      data: oldItemList,
      updatedAt: now,
    };

    await mockStoreRepository.set(TEST_KEY, testColdStorage);

    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition(async (state) => {
      if (
        state.matches('success') &&
        isEqual(state.context.result, oldItemList)
      ) {
        nock('http://localhost:9000')
          .persist()
          .get('/items')
          .reply(200, newItemList);
        testQueryService.send('FORCE_QUERY');
      } else if (state.matches('success')) {
        expect(state.context.result).toEqual(newItemList);
        expect((await mockStoreRepository.get(TEST_KEY)).data).toEqual(
          newItemList,
        );
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should not refetch if not stale', async (done) => {
    const spyFn = jest.fn();
    const mockStoreRepository = getMockStoreRepository();
    const oldItemList = [itemBuilder()];
    const newItemList = [itemBuilder()];
    const now = new Date().getTime();

    const testColdStorage = {
      data: oldItemList,
      updatedAt: now,
    };

    let hasArrivedAtSuccessBefore = false;

    await mockStoreRepository.set(TEST_KEY, testColdStorage);

    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition(async (state) => {
      if (state.matches('success') && !hasArrivedAtSuccessBefore) {
        hasArrivedAtSuccessBefore = true;
        nock('http://localhost:9000')
          .persist()
          .get('/items')
          .reply(200, () => {
            spyFn();
            return newItemList;
          });
        testQueryService.send('QUERY');
      } else if (state.matches('success') && hasArrivedAtSuccessBefore) {
        expect(state.context.result).toEqual(oldItemList);
        expect((await mockStoreRepository.get(TEST_KEY)).data).toEqual(
          oldItemList,
        );
        expect(spyFn).not.toHaveBeenCalled();
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should reset', async (done) => {
    const mockStoreRepository = getMockStoreRepository();
    const itemList = [itemBuilder()];
    const now = new Date().getTime();

    const testColdStorage = {
      data: itemList,
      updatedAt: now,
    };

    await mockStoreRepository.set(TEST_KEY, testColdStorage);

    const testQueryService = getTestQueryService(mockStoreRepository);
    testQueryService.onTransition(async (state) => {
      if (state.matches('success')) {
        testQueryService.send('RESET');
      }
      if (state.matches('idle')) {
        expect(state.context.result).toBeNull();
        expect(state.context.updatedAt).toBeNull();
        expect(state.context.error).toBeNull();
        expect(await mockStoreRepository.get(TEST_KEY)).toBeUndefined();
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });
});

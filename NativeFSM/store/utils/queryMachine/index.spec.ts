import { interpret } from 'xstate';
import nock from 'nock';
import { isEqual } from 'lodash';

import { Item } from '../../../types';
import { itemBuilder } from '../../../test/mocks/item';
import { queryMachineFactory } from '.';
import {
  fetchPromiseFromFetchService,
  getAuthedFetchService,
} from '../../../network/utils';

type Test = Item[];

const STALE_TIME_IN_MINUTES = 30;

const getTestQueryService = () => {
  return interpret(
    queryMachineFactory<Test>({
      id: 'testQueryMachine',
      query: () => {
        return fetchPromiseFromFetchService(
          getAuthedFetchService({
            path: 'items',
            method: 'GET',
          }),
        );
      },
      staleTime: STALE_TIME_IN_MINUTES,
      eventPrefix: 'TEST',
      eventSubscriber: {
        id: 'TEST_EVENT_BUS',
        src: () => () => {},
      },
    }),
  );
};

describe('queryMachine', () => {
  afterEach(async () => {
    nock.cleanAll();
  });
  it('should initialize and become idle', (done) => {
    const testQueryService = getTestQueryService();
    testQueryService.onTransition((state) => {
      if (state.matches('idle')) {
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should fetch data and cache it', (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);
    const testQueryService = getTestQueryService();
    testQueryService.onTransition(async (state) => {
      if (state.matches('idle')) {
        testQueryService.send('QUERY');
      }

      if (state.matches('success')) {
        expect(state.context.result).toEqual([item]);
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should fetch data and handle errors', (done) => {
    nock('http://localhost:9000')
      .persist()
      .get('/items')
      .reply(500, { error: { message: 'Something went wrong' } });
    const testQueryService = getTestQueryService();
    testQueryService.onTransition(async (state) => {
      if (state.matches('idle')) {
        testQueryService.send('QUERY');
      }

      if (state.matches('error')) {
        expect(state.context.error).toEqual(new Error('Something went wrong'));
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should recover from an error', (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000')
      .persist()
      .get('/items')
      .reply(500, { error: { message: 'Something went wrong' } });
    const testQueryService = getTestQueryService();
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
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should force a new query', async (done) => {
    const oldItemList = [itemBuilder()];
    const newItemList = [itemBuilder()];
    const testQueryService = getTestQueryService();

    nock('http://localhost:9000').get('/items').reply(200, oldItemList);

    testQueryService.onTransition(async (state) => {
      if (state.matches('idle')) {
        testQueryService.send('QUERY');
      }
      if (
        state.matches('success') &&
        isEqual(state.context.result, oldItemList)
      ) {
        nock.cleanAll();
        nock('http://localhost:9000').get('/items').reply(200, newItemList);
        testQueryService.send('FORCE_QUERY');
      } else if (state.matches('success')) {
        expect(state.context.result).toEqual(newItemList);
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should not refetch if not stale', async (done) => {
    const spyFn = jest.fn();
    const oldItemList = [itemBuilder()];
    const newItemList = [itemBuilder()];
    const testQueryService = getTestQueryService();

    nock('http://localhost:9000').get('/items').reply(200, oldItemList);

    let hasArrivedAtSuccessBefore = false;
    testQueryService.onTransition(async (state) => {
      if (state.matches('idle')) {
        testQueryService.send('QUERY');
      }
      if (state.matches('success') && !hasArrivedAtSuccessBefore) {
        hasArrivedAtSuccessBefore = true;
        nock.cleanAll();
        nock('http://localhost:9000')
          .get('/items')
          .reply(200, () => {
            spyFn();
            return newItemList;
          });
        testQueryService.send('QUERY');
      } else if (state.matches('success') && hasArrivedAtSuccessBefore) {
        expect(state.context.result).toEqual(oldItemList);
        expect(spyFn).not.toHaveBeenCalled();
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });

  it('should reset', async (done) => {
    const testQueryService = getTestQueryService();

    nock('http://localhost:9000').get('/items').reply(200, [itemBuilder()]);

    let hasArrivedAtIdleBefore = false;
    testQueryService.onTransition(async (state) => {
      if (state.matches('idle') && !hasArrivedAtIdleBefore) {
        hasArrivedAtIdleBefore = true;
        testQueryService.send('QUERY');
      }
      if (state.matches('success')) {
        testQueryService.send('RESET');
      }
      if (state.matches('idle') && hasArrivedAtIdleBefore) {
        expect(state.context.result).toBeNull();
        expect(state.context.updatedAt).toBeNull();
        expect(state.context.error).toBeNull();
        done();
      }
    });

    testQueryService.start();
    testQueryService.send('INITIALIZE');
  });
});

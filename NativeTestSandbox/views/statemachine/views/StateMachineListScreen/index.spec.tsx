import * as React from 'react';
import '@testing-library/jest-native/extend-expect';
import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import nock from 'nock';
import { cleanup, RenderAPI } from '@testing-library/react-native';

import {
  wrappedRender,
  MockedNavigator,
} from '../../../../test/utils/testHelpers';
import { itemBuilder } from '../../../../test/mocks/item';
import { StateMachineListScreen } from '.';
import { Item } from 'types';

type TestCbArgs = {
  renderApi: RenderAPI;
  mockData: Item;
};

describe('StateMachineListScreen', () => {
  const fetchMachine = createMachine({
    tsTypes: {} as import('./index.spec.typegen').Typegen0,
    schema: {
      context: {} as { result: Item[] },
      events: {} as { type: 'FETCH' },
      // events: {} as any,
      // actions: {
      //   type: 'FETCH',
      //   storeResult: ''
      // },
    },
    id: 'StateMachineListScreen',
    context: { result: [] },
    initial: 'idle',
    states: {
      idle: {
        on: {
          FETCH: 'loading',
        },
        meta: {
          test: async ({ renderApi }: TestCbArgs) => {
            const { getByA11yLabel } = renderApi;
            expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
          },
        },
      },
      loading: {
        invoke: {
          src: 'fetchService',
          onDone: 'success',
          onError: 'error',
        },
        meta: {
          test: async ({ renderApi }: TestCbArgs) => {
            const { getByA11yLabel } = renderApi;
            expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
          },
        },
      },
      success: {
        meta: {
          test: async ({ renderApi, mockData }: TestCbArgs) => {
            const { findByText, getByText } = renderApi;
            expect(
              await findByText(`${mockData.firstName} ${mockData.lastName}`),
            ).toBeTruthy();
            expect(
              getByText(`Team Colors: ${mockData.teamColor}`),
            ).toBeTruthy();
          },
        },
      },
      error: {
        meta: {
          test: async ({ renderApi }: TestCbArgs) => {
            const { findByText } = renderApi;
            expect(
              await findByText('Whoops! Something went wrong.'),
            ).toBeTruthy();
          },
        },
      },
    },
  });

  const item = itemBuilder();
  // TODO: Fix the typing on the fetchMachine
  const fetchModel = createModel(fetchMachine as any).withEvents({
    FETCH: {
      exec: () => {},
    },
    'done.invoke.StateMachineListScreen.loading:invocation[0]': {
      exec: () => {},
    },
    'error.platform.StateMachineListScreen.loading:invocation[0]': {
      exec: () => {},
    },
  });

  const testPlans = fetchModel.getShortestPathPlans();

  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      beforeEach(() => {
        switch (plan.state.value) {
          case 'idle':
          case 'loading':
          case 'success':
            nock('http://localhost:9000')
              .get('/items')
              .reply(200, [item])
              .persist();
            break;
          case 'error':
            nock('http://localhost:9000')
              .get('/items')
              .reply(400, { message: 'There was an error' })
              .persist();
            break;
        }
      });

      afterEach(async () => {
        nock.cleanAll();
        cleanup();
      });

      plan.paths.forEach((path) => {
        it(path.description, async () => {
          const renderApi = wrappedRender(
            <MockedNavigator screen={StateMachineListScreen} />,
          );
          await path.test({ renderApi, mockData: item });
        });
      });
    });
  });

  it('should have full coverage', () => {
    return fetchModel.testCoverage();
  });
});

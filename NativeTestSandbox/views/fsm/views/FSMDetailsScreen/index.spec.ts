import '@testing-library/jest-native/extend-expect';
import { assign, createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import { cleanup, RenderAPI } from '@testing-library/react-native';
import nock from 'nock';

import { wrappedRender } from '../../../../test/utils/wrappedRender';
import { itemBuilder } from '../../../../test/mocks/item';
import { FSMDetailsScreen } from '.';
import { machineConfig } from './machine';
import { Item } from 'types';
import { mergeMetaTests } from '../../test/utils/mergeMetaTests';

type TestCbArgs = {
  renderApi: RenderAPI;
  mockData: Item;
};

describe('FSMDetailsScreen', () => {
  const fetchMachine = createMachine(
    mergeMetaTests(machineConfig, {
      idle: async ({ renderApi }: TestCbArgs) => {
        const { getByA11yLabel } = renderApi;
        expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
      },
      loading: async ({ renderApi }: TestCbArgs) => {
        const { getByA11yLabel } = renderApi;
        expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
      },
      success: async ({ renderApi, mockData }: TestCbArgs) => {
        const { findByText, getByText } = renderApi;
        expect(await findByText('Player Details')).toBeTruthy();
        expect(getByText(`First Name: ${mockData.firstName}`)).toBeTruthy();
        expect(getByText(`Last Name: ${mockData.lastName}`)).toBeTruthy();
        expect(getByText(`Team Color: ${mockData.teamColor}`)).toBeTruthy();
      },
      error: async ({ renderApi }: TestCbArgs) => {
        const { findByText } = renderApi;
        expect(await findByText('Whoops! Something went wrong.')).toBeTruthy();
      },
    }),
  );

  const item = itemBuilder();
  const fetchModel = createModel(
    fetchMachine.withConfig({
      actions: {
        storeResult: assign({ result: (_context, event) => event.result }),
      },
    }),
  ).withEvents({
    FETCH: { exec: () => {} },
    'done.invoke.FSMDetailsScreen.loading:invocation[0]': {
      exec: () => {},
      cases: [{ result: item }],
    },
    'error.platform.FSMDetailsScreen.loading:invocation[0]': {
      exec: () => {},
    },
  });

  const testPlans = fetchModel.getShortestPathPlans();

  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      beforeEach(() => {
        switch (plan.state.value) {
          case 'success':
            nock('http://localhost:9000')
              .get(`/items/${item.id}`)
              .reply(200, item);
            break;
          case 'error':
            nock('http://localhost:9000')
              .get(`/items/${item.id}`)
              .reply(500, { error: { message: 'Something went wrong' } });
            break;
        }
      });

      afterEach(async () => {
        nock.cleanAll();
        cleanup();
      });

      plan.paths.forEach((path) => {
        it(path.description, async () => {
          const renderApi = wrappedRender(FSMDetailsScreen, {
            initialParams: { id: item.id },
          });
          await path.test({ renderApi, mockData: item });
        });
      });
    });
  });

  it('should have full coverage', () => {
    return fetchModel.testCoverage();
  });
});

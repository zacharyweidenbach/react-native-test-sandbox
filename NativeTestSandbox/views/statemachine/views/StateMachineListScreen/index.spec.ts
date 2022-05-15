import '@testing-library/jest-native/extend-expect';
import { assign, createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import { cleanup, RenderAPI } from '@testing-library/react-native';
import nock from 'nock';

import { wrappedRender } from '../../../../test/utils/wrappedRender';
import { itemBuilder } from '../../../../test/mocks/item';
import { StateMachineListScreen } from '.';
import { fetchState } from './stateMachine';
import { Item } from 'types';
import { mergeMetaTests } from '../../test/utils/mergeMetaTests';

type TestCbArgs = {
  renderApi: RenderAPI;
  mockData: Item;
};

describe('StateMachineListScreen', () => {
  const fetchMachine = createMachine(
    mergeMetaTests(fetchState, {
      idle: async ({ renderApi }: TestCbArgs) => {
        const { getByA11yLabel } = renderApi;
        expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
      },
      loading: async ({ renderApi }: TestCbArgs) => {
        const { getByA11yLabel } = renderApi;
        expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
      },
      checkResult: async ({ renderApi }: TestCbArgs) => {
        const { getByA11yLabel } = renderApi;
        expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
      },
      successWithContent: async ({ renderApi, mockData }: TestCbArgs) => {
        const { findByText, getByText } = renderApi;
        expect(
          await findByText(`${mockData.firstName} ${mockData.lastName}`),
        ).toBeTruthy();
        expect(getByText(`Team Colors: ${mockData.teamColor}`)).toBeTruthy();
      },
      successNoContent: async ({ renderApi }: TestCbArgs) => {
        const { findByText } = renderApi;
        expect(await findByText('Nothing Here!')).toBeTruthy();
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
        storeResult: assign({
          result: (_ctx, event) => event.result,
        }),
      },
      guards: {
        hasContent: (context) => Boolean((context as any).result.length),
      },
    }),
  ).withEvents({
    FETCH: { exec: () => {} },
    'done.invoke.StateMachineListScreen.loading:invocation[0]': {
      exec: () => {},
      cases: [{ result: [item] }, { result: [] }],
    },
    always: { exec: () => {} },
    'error.platform.StateMachineListScreen.loading:invocation[0]': {
      exec: () => {},
    },
  });

  const testPlans = fetchModel.getShortestPathPlans();

  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      beforeEach(() => {
        switch (plan.state.value) {
          case 'successWithContent':
            nock('http://localhost:9000').get('/items').reply(200, [item]);
            break;
          case 'successNoContent':
            nock('http://localhost:9000').get('/items').reply(200, []);
            break;
          case 'error':
            nock('http://localhost:9000')
              .get('/items')
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
          const renderApi = wrappedRender(StateMachineListScreen);
          await path.test({ renderApi, mockData: item });
        });
      });
    });
  });

  it('should have full coverage', () => {
    return fetchModel.testCoverage();
  });
});

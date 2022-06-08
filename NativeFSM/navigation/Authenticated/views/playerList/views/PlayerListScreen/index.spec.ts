import '@testing-library/jest-native/extend-expect';
import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import { cleanup, RenderAPI } from '@testing-library/react-native';
import nock from 'nock';

import { wrappedRender } from '../../../../../../test/utils/wrappedRender';
import { mergeMetaTests } from '../../../../../../test/utils/mergeMetaTests';
import { itemBuilder } from '../../../../../../test/mocks/item';
import { Item } from '../../../../../../types';
import { PlayerListScreen } from '.';
import { machineConfig } from './machine';
import { getTestStoreHandler } from '../../../../../../test/utils/getTestStoreHandler';

type TestCbArgs = {
  renderApi: RenderAPI;
  mockData: Item;
};

describe('PlayerListScreen', () => {
  const PlayerListScreenMachine = createMachine(
    mergeMetaTests(machineConfig, {
      loading: async ({ renderApi }: TestCbArgs) => {
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

  const PlayerListScreenModel = createModel(
    PlayerListScreenMachine.withConfig({
      guards: {
        hasContent: (_, __, guardMeta) => guardMeta.state.event.hasContent,
      },
    }),
  ).withEvents({
    'done.invoke.PlayerListScreen.loading.fetching:invocation[0]': {
      exec: () => {},
      cases: [{ hasContent: true }, { hasContent: false }],
    },
    'error.platform.PlayerListScreen.loading.fetching:invocation[0]': {
      exec: () => {},
    },
  });

  const item = itemBuilder();
  const testPlans = PlayerListScreenModel.getShortestPathPlans();
  const testStoreHandler = getTestStoreHandler();
  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      beforeEach(() => {
        if (plan.state.matches('successWithContent')) {
          nock('http://localhost:9000').get('/items').reply(200, [item]);
        } else if (plan.state.matches('successNoContent')) {
          nock('http://localhost:9000').get('/items').reply(200, []);
        } else if (plan.state.matches('error')) {
          nock('http://localhost:9000')
            .get('/items')
            .reply(500, { error: { message: 'Something went wrong' } });
        }
      });

      afterEach(async () => {
        nock.cleanAll();
        cleanup();
        testStoreHandler.stopAllStores();
      });

      plan.paths.forEach((path) => {
        it(path.description, async () => {
          const renderApi = await wrappedRender(PlayerListScreen, {
            testStoreHandler,
          });
          await path.test({ renderApi, mockData: item });
        });
      });
    });
  });

  it('should have full coverage', () => {
    return PlayerListScreenModel.testCoverage({
      filter: (stateNode) =>
        stateNode.key !== 'evaluateResult' && stateNode.key !== 'fetching',
    });
  });
});

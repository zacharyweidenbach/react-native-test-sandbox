import '@testing-library/jest-native/extend-expect';
import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import { cleanup, RenderAPI } from '@testing-library/react-native';
import nock from 'nock';

import { getTestStoreHandler } from '../../../../../../test/utils/getTestStoreHandler';
import { wrappedRender } from '../../../../../../test/utils/wrappedRender';
import { mergeMetaTests } from '../../../../../../test/utils/mergeMetaTests';
import { itemBuilder } from '../../../../../../test/mocks/item';
import { Item } from '../../../../../../types';
import { PlayerDetailsScreen } from '.';
import { machineConfig } from './machine';

type TestCbArgs = {
  renderApi: RenderAPI;
  mockData: Item;
};

describe('PlayerDetailScreen', () => {
  const PlayerDetailScreenMachine = createMachine(
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
  const PlayerDetailScreenModel = createModel(
    PlayerDetailScreenMachine.withContext({ playerId: item.id }),
  ).withEvents({
    'done.invoke.PlayerDetailScreen.loading:invocation[0]': {
      exec: () => {},
    },
    'error.platform.PlayerDetailScreen.loading:invocation[0]': {
      exec: () => {},
    },
  });

  const testPlans = PlayerDetailScreenModel.getShortestPathPlans();
  const testStoreHandler = getTestStoreHandler();

  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      beforeEach(() => {
        if (plan.state.matches('success')) {
          nock('http://localhost:9000')
            .get(`/items/${item.id}`)
            .reply(200, item);
        } else if (plan.state.matches('error')) {
          nock('http://localhost:9000')
            .get(`/items/${item.id}`)
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
          const renderApi = await wrappedRender(PlayerDetailsScreen, {
            initialParams: { id: item.id },
            testStoreHandler,
          });
          await path.test({ renderApi, mockData: item });
        });
      });
    });
  });

  it('should have full coverage', () => {
    return PlayerDetailScreenModel.testCoverage();
  });
});

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

type TestCbArgs = {
  renderApi: RenderAPI;
  mockData: Item;
};

machineConfig.states.local = mergeMetaTests(machineConfig.states.local, {
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
});

describe('PlayerListScreen', () => {
  const fetchMachine = createMachine<typeof machineConfig>(machineConfig);
  const fetchModel = createModel(
    fetchMachine.withConfig({
      guards: {
        hasContent: (_, __, guardMeta) => guardMeta.state.event.hasContent,
      },
    }),
  ).withEvents({
    'done.invoke.PlayerListScreen.local.loading.fetching:invocation[0]': {
      exec: () => {},
      cases: [{ hasContent: true }, { hasContent: false }],
    },
    'error.platform.PlayerListScreen.local.loading.fetching:invocation[0]': {
      exec: () => {},
    },
  });

  const item = itemBuilder();
  const testPlans = fetchModel.getShortestPathPlans();

  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      beforeEach(() => {
        if (plan.state.matches('local.successWithContent')) {
          nock('http://localhost:9000').get('/items').reply(200, [item]);
        } else if (plan.state.matches('local.successNoContent')) {
          nock('http://localhost:9000').get('/items').reply(200, []);
        } else if (plan.state.matches('local.error')) {
          nock('http://localhost:9000')
            .get('/items')
            .reply(500, { error: { message: 'Something went wrong' } });
        }
      });

      afterEach(async () => {
        nock.cleanAll();
        cleanup();
      });

      plan.paths.forEach((path) => {
        it(path.description, async () => {
          const renderApi = await wrappedRender(PlayerListScreen);
          await path.test({ renderApi, mockData: item });
        });
      });
    });
  });

  it('should have full coverage', () => {
    return fetchModel.testCoverage({
      filter: (stateNode) =>
        stateNode.key !== 'evaluateResult' &&
        stateNode.key !== 'fetching' &&
        stateNode.key !== 'playerListSubscriber' &&
        stateNode.key !== 'local',
    });
  });
});

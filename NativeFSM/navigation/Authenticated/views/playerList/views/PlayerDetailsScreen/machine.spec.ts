import { interpret } from 'xstate';
import nock from 'nock';

import { itemBuilder } from '../../../../../../test/mocks/item';
import { PlayerDetailScreenMachine } from './machine';
import { playerDetailQueryManager } from '../../../../../../store/players/playerDetail';
import { getQueryServiceMethods } from '../../../../../../store/utils/getQueryServiceMethods';
import { Item } from '../../../../../../types';

const testSetup = async (item: Item) => {
  const playerDetailService = interpret(
    playerDetailQueryManager.queryMachine,
  ).start();
  const playerDetailQuery = getQueryServiceMethods(playerDetailService);
  await playerDetailQuery.initializeAsync();

  const playerDetailScreenService = interpret(
    PlayerDetailScreenMachine.withContext({ playerId: item.id }).withConfig({
      services: {
        playerDetailQuery: (context) =>
          playerDetailQuery.queryAsync({ playerId: context.playerId }),
      },
    }),
  );

  return { playerDetailQuery, playerDetailService, playerDetailScreenService };
};

describe('PlayerDetailScreenMachine', () => {
  afterEach(async () => {
    nock.cleanAll();
  });

  it('should eventually reach loading', async (done) => {
    const item = itemBuilder();
    const { playerDetailService, playerDetailScreenService } = await testSetup(
      item,
    );
    nock('http://localhost:9000').get(`/items/${item.id}`).reply(200, item);

    playerDetailScreenService.onTransition((state) => {
      if (state.matches('loading')) {
        playerDetailService.stop();
        playerDetailScreenService.stop();
        done();
      }
    });

    playerDetailScreenService.start();
  });

  it('should eventually reach success', async (done) => {
    const item = itemBuilder();
    const { playerDetailService, playerDetailScreenService } = await testSetup(
      item,
    );
    nock('http://localhost:9000').get(`/items/${item.id}`).reply(200, item);

    playerDetailScreenService.onTransition((state) => {
      if (state.matches('success')) {
        playerDetailService.stop();
        playerDetailScreenService.stop();
        done();
      }
    });

    playerDetailScreenService.start();
  });

  it('should eventually reach error', async (done) => {
    const item = itemBuilder();
    const { playerDetailService, playerDetailScreenService } = await testSetup(
      item,
    );
    nock('http://localhost:9000')
      .get(`/items/${item.id}`)
      .reply(500, { error: { message: 'Something went wrong' } });

    playerDetailScreenService.onTransition((state) => {
      if (state.matches('error')) {
        playerDetailService.stop();
        playerDetailScreenService.stop();
        done();
      }
    });

    playerDetailScreenService.start();
  });

  it('should reload on playerDetail reset', async (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000')
      .persist()
      .get(`/items/${item.id}`)
      .reply(200, item);
    const {
      playerDetailQuery,
      playerDetailService,
      playerDetailScreenService,
    } = await testSetup(item);

    let hasReachedSuccessBefore = false;
    playerDetailScreenService.onTransition((state) => {
      if (state.matches('success') && !hasReachedSuccessBefore) {
        hasReachedSuccessBefore = true;
        playerDetailQuery.reset();
      } else if (state.matches('success') && hasReachedSuccessBefore) {
        playerDetailService.stop();
        playerDetailScreenService.stop();
        done();
      }
    });

    playerDetailScreenService.start();
  });
});

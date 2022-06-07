import { interpret } from 'xstate';
import nock from 'nock';

import { itemBuilder } from '../../../../../../test/mocks/item';
import { PlayerListScreenMachine } from './machine';
import { playerListQueryMachine } from '../../../../../../store/players/playerList';
import { getQueryServiceMethods } from '../../../../../../store/utils/getQueryServiceMethods';

const testSetup = async () => {
  const playerListService = interpret(playerListQueryMachine).start();
  const playerListQuery = getQueryServiceMethods(playerListService);
  await playerListQuery.initializeAsync();

  const playerListScreenService = interpret(
    PlayerListScreenMachine.withConfig({
      services: {
        playerListQuery: playerListQuery.queryAsync,
      },
      guards: {
        hasContent: () => {
          const playerList = playerListQuery.getCurrentValue();
          if (Array.isArray(playerList)) {
            return playerList.length > 0;
          } else {
            return false;
          }
        },
      },
    }),
  );

  return { playerListQuery, playerListService, playerListScreenService };
};

describe('PlayerListScreenMachine', () => {
  afterEach(async () => {
    nock.cleanAll();
  });

  it('should eventually reach loading', async (done) => {
    nock('http://localhost:9000').get('/items').reply(200, []);
    const { playerListService, playerListScreenService } = await testSetup();

    playerListScreenService.onTransition((state) => {
      if (state.matches('loading')) {
        playerListScreenService.stop();
        playerListService.stop();
        done();
      }
    });

    playerListScreenService.start();
  });

  it('should eventually reach successWithContent', async (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);
    const { playerListService, playerListScreenService } = await testSetup();
    playerListScreenService.onTransition((state) => {
      if (state.matches('successWithContent')) {
        playerListScreenService.stop();
        playerListService.stop();
        done();
      }
    });

    playerListScreenService.start();
  });

  it('should eventually reach successNoContent', async (done) => {
    nock('http://localhost:9000').get('/items').reply(200, []);
    const { playerListService, playerListScreenService } = await testSetup();
    playerListScreenService.onTransition((state) => {
      if (state.matches('successNoContent')) {
        playerListScreenService.stop();
        playerListService.stop();
        done();
      }
    });

    playerListScreenService.start();
  });

  it('should eventually reach error', async (done) => {
    nock('http://localhost:9000')
      .persist()
      .get('/items')
      .reply(500, { error: { message: 'Something went wrong' } });
    const { playerListService, playerListScreenService } = await testSetup();
    playerListScreenService.onTransition((state) => {
      if (state.matches('error')) {
        playerListScreenService.stop();
        playerListService.stop();
        done();
      }
    });

    playerListScreenService.start();
  });

  it('should reload on playerList reset', async (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').persist().get('/items').reply(200, [item]);
    const { playerListQuery, playerListService, playerListScreenService } =
      await testSetup();

    let hasReachedSuccessWithContentBefore = false;
    playerListScreenService.onTransition((state) => {
      if (
        state.matches('successWithContent') &&
        !hasReachedSuccessWithContentBefore
      ) {
        hasReachedSuccessWithContentBefore = true;
        playerListQuery.reset();
      } else if (
        state.matches('successWithContent') &&
        hasReachedSuccessWithContentBefore
      ) {
        playerListScreenService.stop();
        playerListService.stop();
        done();
      }
    });

    playerListScreenService.start();
  });
});

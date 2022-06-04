import { interpret } from 'xstate';
import nock from 'nock';

import { itemBuilder } from '../../../../../../test/mocks/item';
import { PlayerListScreenMachine } from './machine';
import {
  PlayerList,
  playerListQueryMachine,
} from '../../../../../../store/players/playerList';
import {
  GetQueryServiceMethods,
  getQueryServiceMethods,
} from '../../../../../../store/utils/getQueryServiceMethods';

const initializePlayerListService = async () => {
  const playerListService = interpret(playerListQueryMachine).start();
  const playerListQuery = getQueryServiceMethods(playerListService);
  await playerListQuery.initializeAsync();

  return playerListQuery;
};

const getPlayerListScreenService = (
  serviceQuery: GetQueryServiceMethods<PlayerList>,
) =>
  interpret(
    PlayerListScreenMachine.withConfig({
      services: {
        playerListQuery: serviceQuery.queryAsync,
      },
      guards: {
        hasContent: () => {
          const playerList = serviceQuery.getCurrentValue();
          if (Array.isArray(playerList)) {
            return playerList.length > 0;
          } else {
            return false;
          }
        },
      },
    }),
  );

describe('PlayerListScreenMachine', () => {
  afterEach(async () => {
    nock.cleanAll();
  });

  it('should eventually reach loading', async (done) => {
    nock('http://localhost:9000').get('/items').reply(200, []);
    const playerListQuery = await initializePlayerListService();
    const playerListScreenService = getPlayerListScreenService(playerListQuery);

    playerListScreenService.onTransition((state) => {
      if (state.matches('local.loading')) {
        done();
      }
    });

    playerListScreenService.start();
  });

  it('should eventually reach successWithContent', async (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);
    const playerListQuery = await initializePlayerListService();
    const playerListScreenService = getPlayerListScreenService(playerListQuery);
    playerListScreenService.onTransition((state) => {
      if (state.matches('local.successWithContent')) {
        done();
      }
    });

    playerListScreenService.start();
  });

  it('should eventually reach successNoContent', async (done) => {
    nock('http://localhost:9000').get('/items').reply(200, []);
    const playerListQuery = await initializePlayerListService();
    const playerListScreenService = getPlayerListScreenService(playerListQuery);
    playerListScreenService.onTransition((state) => {
      if (state.matches('local.successNoContent')) {
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
    const playerListQuery = await initializePlayerListService();
    const playerListScreenService = getPlayerListScreenService(playerListQuery);
    playerListScreenService.onTransition((state) => {
      if (state.matches('local.error')) {
        done();
      }
    });

    playerListScreenService.start();
  });

  it('should reload on playerList reset', async (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').persist().get('/items').reply(200, [item]);
    const playerListQuery = await initializePlayerListService();
    const playerListScreenService = getPlayerListScreenService(playerListQuery);

    let hasReachedSuccessWithContentBefore = false;
    playerListScreenService.onTransition((state) => {
      if (
        state.matches('local.successWithContent') &&
        !hasReachedSuccessWithContentBefore
      ) {
        hasReachedSuccessWithContentBefore = true;
        playerListQuery.reset();
      } else if (
        state.matches('local.successWithContent') &&
        hasReachedSuccessWithContentBefore
      ) {
        done();
      }
    });

    playerListScreenService.start();
  });
});

import { interpret } from 'xstate';

import { getQueryServiceMethods } from '../../store/utils/getQueryServiceMethods';
import { authQueryMachine } from '../../store/auth';
import { playerListQueryMachine } from '../../store/players/playerList';
import { playerDetailQueryMachine } from '../../store/players/playerDetail';

export const getTestStoreHandler = () => {
  const authQueryService = interpret(authQueryMachine);
  const playerListQueryService = interpret(playerListQueryMachine);
  const playerDetailQueryService = interpret(playerDetailQueryMachine);

  const authQueryMethods = getQueryServiceMethods(authQueryService);
  const playerListQueryMethods = getQueryServiceMethods(playerListQueryService);
  const playerDetailQueryMethods = getQueryServiceMethods(
    playerDetailQueryService,
  );

  return {
    startAndInitializeAllStores: async () => {
      authQueryService.start();
      playerListQueryService.start();
      await authQueryMethods.initializeAsync();
      await playerListQueryMethods.initializeAsync();
      await playerDetailQueryMethods.initializeAsync();
    },
    stopAllStores: () => {
      authQueryService.stop();
      playerListQueryService.stop();
    },
    authQuery: {
      service: authQueryService,
      ...authQueryMethods,
    },
    playerListQuery: {
      service: playerListQueryService,
      ...playerListQueryMethods,
    },
    playerDetailQuery: {
      service: playerDetailQueryService,
      ...playerDetailQueryMethods,
    },
  } as const;
};

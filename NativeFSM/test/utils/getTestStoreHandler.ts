import { interpret } from 'xstate';

import { getQueryServiceMethods } from '../../store/utils/getQueryServiceMethods';
import { authQueryMachine } from '../../store/auth';
import { playerListQueryMachine } from '../../store/players/playerList';

export const getTestStoreHandler = () => {
  const authQueryService = interpret(authQueryMachine);
  const playerListQueryService = interpret(playerListQueryMachine);

  const authQueryMethods = getQueryServiceMethods(authQueryService);
  const playerListQueryMethods = getQueryServiceMethods(playerListQueryService);

  return {
    startAndInitializeAllStores: async () => {
      authQueryService.start();
      playerListQueryService.start();
      await authQueryMethods.initializeAsync();
      await playerListQueryMethods.initializeAsync();
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
  } as const;
};

import React from 'react';
import { interpret } from 'xstate';

import { StoreContext } from '../../../store/store.provider';
import { getQueryServiceMethods } from '../../../store/utils/getQueryServiceMethods';
import { authQueryMachine } from '../../../store/auth';
import { useAuthQuery, useAuth } from '../../../store/auth/hooks';
import { playerListQueryMachine } from '../../../store/players/playerList';
import {
  usePlayerListQuery,
  usePlayerList,
} from '../../../store/players/playerList/hooks';

export const getTestStoreProvider = async () => {
  const authInterpretedService = interpret(authQueryMachine).start();
  const playerListInterpretedService = interpret(
    playerListQueryMachine,
  ).start();

  const authQueryMethods = getQueryServiceMethods(authInterpretedService);
  const playerListQueryMethods = getQueryServiceMethods(
    playerListInterpretedService,
  );

  await authQueryMethods.initializeAsync();
  await playerListQueryMethods.initializeAsync();

  return ({ children }: any) => {
    const authQuery = useAuthQuery(authInterpretedService);
    const auth = useAuth(authInterpretedService);
    const playerListQuery = usePlayerListQuery(playerListInterpretedService);
    const playerList = usePlayerList(playerListInterpretedService);

    return (
      <StoreContext.Provider
        value={{
          authQuery,
          auth,
          playerListQuery,
          playerList,
        }}
      >
        {children}
      </StoreContext.Provider>
    );
  };
};

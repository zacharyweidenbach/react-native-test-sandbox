import React from 'react';

import { StoreContext } from '../../../store/store.provider';
import { useAuthQuery, useAuth } from '../../../store/auth/hooks';
import {
  usePlayerListQuery,
  usePlayerList,
} from '../../../store/players/playerList/hooks';
import {
  usePlayerDetailQuery,
  usePlayerDetail,
} from '../../../store/players/playerDetail/hooks';
import { getTestStoreHandler } from '../getTestStoreHandler';

export const getTestStoreProvider = async () => {
  const testStoreHandler = getTestStoreHandler();
  await testStoreHandler.startAndInitializeAllStores();

  return ({ children }: any) => {
    const authQuery = useAuthQuery(testStoreHandler.authQuery.service);
    const auth = useAuth(testStoreHandler.authQuery.service);
    const playerListQuery = usePlayerListQuery(
      testStoreHandler.playerListQuery.service,
    );
    const playerList = usePlayerList(testStoreHandler.playerListQuery.service);
    const playerDetailQuery = usePlayerDetailQuery(
      testStoreHandler.playerDetailQuery.service,
    );
    const playerDetail = usePlayerDetail(
      testStoreHandler.playerDetailQuery.service,
    );

    return (
      <StoreContext.Provider
        value={{
          authQuery,
          auth,
          playerListQuery,
          playerList,
          playerDetailQuery,
          playerDetail,
        }}
      >
        {children}
      </StoreContext.Provider>
    );
  };
};

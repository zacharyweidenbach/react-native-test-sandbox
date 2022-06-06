import React, { createContext, useContext } from 'react';

import { useAuthService, useAuthQuery, useAuth } from './auth/hooks';
import {
  usePlayerListService,
  usePlayerListQuery,
  usePlayerList,
} from './players/playerList/hooks';

import {
  usePlayerDetailService,
  usePlayerDetailQuery,
  usePlayerDetail,
} from './players/playerDetail/hooks';

export type StoreContextValues = {
  authQuery: ReturnType<typeof useAuthQuery>;
  auth: ReturnType<typeof useAuth>;
  playerListQuery: ReturnType<typeof usePlayerListQuery>;
  playerList: ReturnType<typeof usePlayerList>;
  playerDetailQuery: ReturnType<typeof usePlayerDetailQuery>;
  playerDetail: ReturnType<typeof usePlayerDetail>;
};

export const StoreContext = createContext<StoreContextValues>(
  {} as StoreContextValues,
);

export const useStoreContext = () => {
  return useContext(StoreContext);
};

export const StoreProvider: React.FC = ({ children }) => {
  const authService = useAuthService();
  const authQuery = useAuthQuery(authService);
  const auth = useAuth(authService);

  const playerListService = usePlayerListService();
  const playerListQuery = usePlayerListQuery(playerListService);
  const playerList = usePlayerList(playerListService);

  const playerDetailService = usePlayerDetailService();
  const playerDetailQuery = usePlayerDetailQuery(playerDetailService);
  const playerDetail = usePlayerDetail(playerDetailService);

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

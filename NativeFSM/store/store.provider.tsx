import React, { createContext, useContext } from 'react';

import store from '.';

export type StoreContextValues = {
  accessToken: ReturnType<typeof store.accessToken.hook>;
  playerList: ReturnType<typeof store.playerList.hook>;
  playerDetail: ReturnType<typeof store.playerDetail.hook>;
};

export const StoreContext = createContext<StoreContextValues>(
  {} as StoreContextValues,
);

export const useStoreContext = () => {
  return useContext(StoreContext);
};

export const StoreProvider: React.FC = ({ children }) => {
  return (
    <StoreContext.Provider
      value={{
        accessToken: store.accessToken.hook(),
        playerList: store.playerList.hook(),
        playerDetail: store.playerDetail.hook(),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

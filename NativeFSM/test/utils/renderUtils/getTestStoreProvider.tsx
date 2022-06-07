import React from 'react';

import { StoreContext } from '../../../store/store.provider';
import { useCurrentValueAndMethods } from '../../../store/utils/queryManagerFactory/hookGenerator';
import { getTestStoreHandler } from '../getTestStoreHandler';

type Options = {
  testStoreHandler?: ReturnType<typeof getTestStoreHandler>;
};

export const getTestStoreProvider = async (options: Options) => {
  const testStoreHandler = options.testStoreHandler || getTestStoreHandler();
  await testStoreHandler.startAndInitializeAllStores();

  return ({ children }: any) => {
    return (
      <StoreContext.Provider
        value={{
          accessToken: useCurrentValueAndMethods(
            testStoreHandler.serviceMap.accessToken as any,
          ),
          playerList: useCurrentValueAndMethods(
            testStoreHandler.serviceMap.playerList as any,
          ),
          playerDetail: useCurrentValueAndMethods(
            testStoreHandler.serviceMap.playerDetail as any,
          ),
        }}
      >
        {children}
      </StoreContext.Provider>
    );
  };
};

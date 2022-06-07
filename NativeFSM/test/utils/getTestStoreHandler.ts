import { interpret } from 'xstate';

import { getQueryServiceMethods } from '../../store/utils/getQueryServiceMethods';
import store from '../../store';

export const getTestStoreHandler = () => {
  const serviceMap = Object.keys(store).reduce((acc, key) => {
    const queryManager = store[key as keyof typeof store];
    acc[key as keyof typeof store] = interpret(
      queryManager.queryMachine as any,
    );
    return acc;
  }, {} as { [key in keyof typeof store]: any });

  const serviceList = Object.keys(serviceMap).map(
    (key) => serviceMap[key as keyof typeof serviceMap],
  );
  const queryMethodsList = serviceList.map((service) =>
    getQueryServiceMethods(service as any),
  );

  return {
    startAndInitializeAllStores: async () => {
      for (const service of serviceList) {
        service.start();
      }

      for (const queryMethods of queryMethodsList) {
        await queryMethods.initializeAsync();
      }
    },
    stopAllStores: () => {
      for (const service of serviceList) {
        service.stop();
      }
    },
    serviceMap,
  } as const;
};

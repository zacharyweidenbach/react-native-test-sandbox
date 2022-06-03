import { cloneDeep } from 'lodash';

export const getMockStoreInferface = () => {
  let store = {} as { [key: string]: any };

  return {
    getItem: (key: string) => {
      return Promise.resolve(store[key]);
    },
    setItem: (key: string, value: any) => {
      store[key] = cloneDeep(value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      delete store[key];
      return Promise.resolve();
    },
  };
};

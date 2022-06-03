type StorageInterface = {
  getItem: (key: string) => Promise<any | undefined>;
  setItem: (key: string, value: any) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export const getStoreRepository = (IStorage: StorageInterface) => {
  return {
    get: (key: string) => {
      return IStorage.getItem(key);
    },
    set: (key: string, value: any) => {
      return IStorage.setItem(key, value);
    },
    remove: (key: string) => {
      return IStorage.removeItem(key);
    },
  };
};

export type StoreRepository = ReturnType<typeof getStoreRepository>;

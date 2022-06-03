import { StoreInterface } from './StoreInterface';
import { getStoreRepository } from './getStoreRepository';

export const storeRepository = getStoreRepository(StoreInterface);

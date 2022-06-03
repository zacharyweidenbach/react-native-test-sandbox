import { getStoreRepository } from './getStoreRepository';
import { getMockStoreInferface } from './StoreInterface.mock';

export const getMockStoreRepository = () =>
  getStoreRepository(getMockStoreInferface());

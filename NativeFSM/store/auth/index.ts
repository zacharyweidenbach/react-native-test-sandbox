import { fetchMachine, defaultContext } from '../../network/fetchMachine';
import { queryMachineWithColdStoreFactory } from '../utils/queryMachineWithColdStorage';
import { storeRepository } from '../utils/StoreRepository';
import { fromEventBus } from '../../utils/xstate/fromEventBus';
import { EventBus } from '../../utils/xstate/EventBus';

export const AUTH_STORE_KEY = 'auth';
export const AUTH_STALE_TIME = 30;

export type AuthData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export const events = {
  INITIALIZED: 'AUTH.INITIALIZED',
  LOADING: 'AUTH.LOADING',
  SUCCESS: 'AUTH.SUCCESS',
  ERROR: 'AUTH.ERROR',
  RESET: 'AUTH.RESET',
};

const ID = 'AUTH';
const eventBus = new EventBus(ID);
export const authSubscription = {
  id: ID,
  src: fromEventBus(() => eventBus),
};

export const authQueryMachine = queryMachineWithColdStoreFactory<AuthData>({
  storeRepository,
  id: 'authQueryMachine',
  storageKey: AUTH_STORE_KEY,
  query: fetchMachine.withContext({ ...defaultContext, path: 'token' }),
  staleTime: AUTH_STALE_TIME,
  eventPrefix: ID,
  eventBusConfig: authSubscription,
});

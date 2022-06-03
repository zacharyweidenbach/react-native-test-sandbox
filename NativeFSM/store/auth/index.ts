import { fetchMachine, defaultContext } from '../../network/fetchMachine';
import { queryMachineWithColdStoreFactory } from '../utils/queryMachineWithColdStorage';
import { storeRepository } from '../utils/StoreRepository';
import { eventStreamFactory } from '../utils/eventStreamFactory';
import { subscriptionMachineFactory } from '../utils/subscriptionMachineFactory';

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

export const authEventStreamHandler = eventStreamFactory(events);

export const authQueryMachine = queryMachineWithColdStoreFactory<AuthData>({
  storeRepository,
  id: 'authQueryMachine',
  storageKey: AUTH_STORE_KEY,
  query: fetchMachine.withContext({ ...defaultContext, path: 'token' }),
  staleTime: AUTH_STALE_TIME,
  emitHandler: authEventStreamHandler,
});

export const authSubscriptionMachine = subscriptionMachineFactory({
  id: 'authSubscriptionMachine',
  events,
  eventStream: authEventStreamHandler.eventStream,
});

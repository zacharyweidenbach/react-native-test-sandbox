import { queryManagerFactory } from '../utils/queryManagerFactory';
import { fetchMachine, defaultContext } from '../../network/fetchMachine';

export type Events =
  | { type: 'ACCESS_TOKEN.INITIALIZED' }
  | { type: 'ACCESS_TOKEN.LOADING' }
  | { type: 'ACCESS_TOKEN.SUCCESS' }
  | { type: 'ACCESS_TOKEN.ERROR' }
  | { type: 'ACCESS_TOKEN.RESET' };

export const accessTokenQueryManager = queryManagerFactory<
  {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  },
  { authCode: string },
  Events
>({
  machineId: 'accessTokenQueryMachine',
  persistToStorage: true,
  eventPrefix: 'ACCESS_TOKEN',
  query: fetchMachine.withContext({ ...defaultContext, path: 'token' }),
  staleTime: Infinity, // minutes
});

import { Item } from '../../types';
import {
  fetchPromiseFromFetchService,
  getAuthedFetchService,
} from '../../network/utils';
import { queryManagerFactory } from '../utils/queryManagerFactory';

export type Events =
  | { type: 'PLAYER_LIST.INITIALIZED' }
  | { type: 'PLAYER_LIST.LOADING' }
  | { type: 'PLAYER_LIST.SUCCESS' }
  | { type: 'PLAYER_LIST.ERROR' }
  | { type: 'PLAYER_LIST.RESET' };

export const playerListQueryManager = queryManagerFactory<
  Item[],
  undefined,
  Events
>({
  machineId: 'playerListQueryMachine',
  persistToStorage: false,
  eventPrefix: 'PLAYER_LIST',
  query: () => {
    return fetchPromiseFromFetchService(
      getAuthedFetchService({
        path: 'items',
        method: 'GET',
      }),
    );
  },
  staleTime: 10, // minutes
});

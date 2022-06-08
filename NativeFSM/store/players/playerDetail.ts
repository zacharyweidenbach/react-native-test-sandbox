import { Item } from '../../types';
import {
  fetchPromiseFromFetchService,
  getAuthedFetchService,
} from '../../network/utils';
import { queryManagerFactory } from '../utils/queryManagerFactory';

export type Events =
  | { type: 'PLAYER_DETAIL.INITIALIZED' }
  | { type: 'PLAYER_DETAIL.LOADING' }
  | { type: 'PLAYER_DETAIL.SUCCESS' }
  | { type: 'PLAYER_DETAIL.ERROR' }
  | { type: 'PLAYER_DETAIL.RESET' };

export const playerDetailQueryManager = queryManagerFactory<
  Item,
  { playerId: string },
  Events
>({
  machineId: 'playerDetailQueryMachine',
  persistToStorage: false,
  eventPrefix: 'PLAYER_DETAIL',
  query: (_: any, event: { playerId: string }) => {
    return fetchPromiseFromFetchService(
      getAuthedFetchService({
        path: `items/${event.playerId}`,
        method: 'GET',
      }),
    );
  },
  staleTime: 0, // minutes
});

import { Item } from '../../../types';
import {
  fetchPromiseFromFetchService,
  getAuthedFetchService,
} from '../../../network/utils';
import { queryMachineFactory } from '../../utils/queryMachine';
import { fromEventBus } from '../../../utils/xstate/fromEventBus';
import { EventBus } from '../../../utils/xstate/EventBus';

export const PLAYER_DETAIL_STALE_TIME = 0;

export type Player = Item;

export const playerDetailEvents = {
  INITIALIZED: 'PLAYER_DETAIL.INITIALIZED',
  LOADING: 'PLAYER_DETAIL.LOADING',
  SUCCESS: 'PLAYER_DETAIL.SUCCESS',
  ERROR: 'PLAYER_DETAIL.ERROR',
  RESET: 'PLAYER_DETAIL.RESET',
};

const ID = 'PLAYER_DETAIL';
export type Events =
  | { type: 'PLAYER_DETAIL.INITIALIZED' }
  | { type: 'PLAYER_DETAIL.LOADING' }
  | { type: 'PLAYER_DETAIL.SUCCESS' }
  | { type: 'PLAYER_DETAIL.ERROR' }
  | { type: 'PLAYER_DETAIL.RESET' };
const eventBus = new EventBus<Events>(ID);
export type PlayerDetailArgs = { playerId: string };
export const playerDetailSubscription = {
  id: ID,
  src: fromEventBus(() => eventBus),
};

export const playerDetailQueryMachine = queryMachineFactory<Player>({
  id: 'PlayerDetailQueryMachine',
  query: (_: any, event: { playerId: string }) => {
    return fetchPromiseFromFetchService(
      getAuthedFetchService({
        path: `items/${event.playerId}`,
        method: 'GET',
      }),
    );
  },
  staleTime: PLAYER_DETAIL_STALE_TIME,
  eventPrefix: ID,
  eventBusConfig: playerDetailSubscription,
});

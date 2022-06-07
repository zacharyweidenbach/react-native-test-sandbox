import { Item } from '../../../types';
import {
  fetchPromiseFromFetchService,
  getAuthedFetchService,
} from '../../../network/utils';
import { queryMachineFactory } from '../../utils/queryMachine';
import { fromEventBus } from '../../../utils/xstate/fromEventBus';
import { EventBus } from '../../../utils/xstate/EventBus';

export const PLAYER_DETAIL_STALE_TIME = 30;

export type Player = Item;

export const playerDetailEvents = {
  INITIALIZED: 'PLAYER_DETAIL.INITIALIZED',
  LOADING: 'PLAYER_DETAIL.LOADING',
  SUCCESS: 'PLAYER_DETAIL.SUCCESS',
  ERROR: 'PLAYER_DETAIL.ERROR',
  RESET: 'PLAYER_DETAIL.RESET',
};

const ID = 'PLAYER_DETAIL';
const eventBus = new EventBus(ID);
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

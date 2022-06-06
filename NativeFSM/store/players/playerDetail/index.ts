import { Item } from '../../../types';
import {
  fetchPromiseFromFetchService,
  getAuthedFetchService,
} from '../../../network/utils';
import { eventStreamFactory } from '../../utils/eventStreamFactory';
import { subscriptionMachineFactory } from '../../utils/subscriptionMachineFactory';
import { queryMachineFactory } from '../../utils/queryMachine';

export const PLAYER_DETAIL_STALE_TIME = 30;

export type Player = Item;

export const playerDetailEvents = {
  INITIALIZED: 'PLAYER_DETAIL.INITIALIZED',
  LOADING: 'PLAYER_DETAIL.LOADING',
  SUCCESS: 'PLAYER_DETAIL.SUCCESS',
  ERROR: 'PLAYER_DETAIL.ERROR',
  RESET: 'PLAYER_DETAIL.RESET',
};

export const playerDetailEventStreamHandler =
  eventStreamFactory(playerDetailEvents);

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
  emitHandler: playerDetailEventStreamHandler,
});

export const playerDetailSubscriptionMachine = subscriptionMachineFactory({
  id: 'playerDetailSubscriptionMachine',
  events: playerDetailEvents,
  eventStream: playerDetailEventStreamHandler.eventStream,
});

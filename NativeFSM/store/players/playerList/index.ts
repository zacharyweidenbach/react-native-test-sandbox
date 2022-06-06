import { Item } from '../../../types';
import {
  fetchPromiseFromFetchService,
  getAuthedFetchService,
} from '../../../network/utils';
import { eventStreamFactory } from '../../utils/eventStreamFactory';
import { subscriptionMachineFactory } from '../../utils/subscriptionMachineFactory';
import { queryMachineFactory } from '../../utils/queryMachine';

export const PLAYER_LIST_STALE_TIME = 30;

export type PlayerList = Item[];

export const playerListEvents = {
  INITIALIZED: 'PLAYER_LIST.INITIALIZED',
  LOADING: 'PLAYER_LIST.LOADING',
  SUCCESS: 'PLAYER_LIST.SUCCESS',
  ERROR: 'PLAYER_LIST.ERROR',
  RESET: 'PLAYER_LIST.RESET',
};

export const playerListEventStreamHandler =
  eventStreamFactory(playerListEvents);

export const playerListQueryMachine = queryMachineFactory<PlayerList>({
  id: 'playerListQueryMachine',
  query: () => {
    return fetchPromiseFromFetchService(
      getAuthedFetchService({
        path: 'items',
        method: 'GET',
      }),
    );
  },
  staleTime: PLAYER_LIST_STALE_TIME,
  emitHandler: playerListEventStreamHandler,
});

export const playerListSubscriptionMachine = subscriptionMachineFactory({
  id: 'playerListSubscriptionMachine',
  events: playerListEvents,
  eventStream: playerListEventStreamHandler.eventStream,
});

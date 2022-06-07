import { Item } from '../../../types';
import {
  fetchPromiseFromFetchService,
  getAuthedFetchService,
} from '../../../network/utils';
import { queryMachineFactory } from '../../utils/queryMachine';
import { fromEventBus } from '../../../utils/xstate/fromEventBus';
import { EventBus } from '../../../utils/xstate/EventBus';

export const PLAYER_LIST_STALE_TIME = 30;

export type PlayerList = Item[];

export const playerListEvents = {
  INITIALIZED: 'PLAYER_LIST.INITIALIZED',
  LOADING: 'PLAYER_LIST.LOADING',
  SUCCESS: 'PLAYER_LIST.SUCCESS',
  ERROR: 'PLAYER_LIST.ERROR',
  RESET: 'PLAYER_LIST.RESET',
};

const ID = 'PLAYER_LIST';
export type Events =
  | { type: 'PLAYER_LIST.INITIALIZED' }
  | { type: 'PLAYER_LIST.LOADING' }
  | { type: 'PLAYER_LIST.SUCCESS' }
  | { type: 'PLAYER_LIST.ERROR' }
  | { type: 'PLAYER_LIST.RESET' };
const eventBus = new EventBus<Events>(ID);
export const playerListSubscription = {
  id: ID,
  src: fromEventBus(() => eventBus),
};

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
  eventPrefix: ID,
  eventBusConfig: playerListSubscription,
});

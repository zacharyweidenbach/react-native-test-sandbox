import { useInterpret, useSelector } from '@xstate/react';
import {
  playerListEvents,
  playerListSubscription,
  Events,
} from '../../../../../../store/players/playerList';
import { createMachine, createSchema } from 'xstate';

import { useStoreContext } from '../../../../../../store/store.provider';

export const machineConfig = {
  tsTypes: {} as import('./machine.typegen').Typegen0,
  schema: {
    events: createSchema<Events>(),
    services: createSchema<{
      playerListQuery: {
        data: any;
      };
    }>(),
  },
  id: 'PlayerListScreen',
  initial: 'loading',
  states: {
    loading: {
      initial: 'fetching',
      states: {
        fetching: {
          invoke: {
            src: 'playerListQuery',
            onDone: 'evaluateResult',
            onError: '#PlayerListScreen.error',
          },
        },
        evaluateResult: {
          always: [
            {
              target: '#PlayerListScreen.successWithContent',
              cond: 'hasContent',
            },
            { target: '#PlayerListScreen.successNoContent' },
          ],
        },
      },
    },
    successWithContent: {},
    successNoContent: {},
    error: {},
  },
  invoke: playerListSubscription,
  on: {
    [playerListEvents.RESET]: 'loading',
  },
};

export const PlayerListScreenMachine = createMachine(machineConfig);

export const usePlayerListScreenMachine = () => {
  const { playerListQuery } = useStoreContext();

  const playerListScreenService = useInterpret(PlayerListScreenMachine, {
    services: {
      playerListQuery: playerListQuery.queryAsync,
    },
    guards: {
      hasContent: () => {
        const playerList = playerListQuery.getCurrentValue();
        if (Array.isArray(playerList)) {
          return playerList.length > 0;
        } else {
          return false;
        }
      },
    },
  });

  const isLoading = useSelector(playerListScreenService, (state) =>
    state.matches('loading'),
  );
  const isError = useSelector(playerListScreenService, (state) =>
    state.matches('error'),
  );

  return { isLoading, isError };
};

import { useInterpret, useSelector } from '@xstate/react';
import { createMachine, createSchema } from 'xstate';

import { useStoreContext } from '../../../../../../store/store.provider';
import {
  Events,
  playerListQueryManager,
} from '../../../../../../store/players/playerList';
import { Item } from '../../../../../../types';

export const machineConfig = {
  tsTypes: {} as import('./machine.typegen').Typegen0,
  schema: {
    events: createSchema<Events>(),
    services: createSchema<{
      playerListQuery: {
        data: Item[];
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
  invoke: playerListQueryManager.subscription,
  on: {
    [playerListQueryManager.events.RESET]: 'loading',
  },
};

export const PlayerListScreenMachine = createMachine(machineConfig);

export const usePlayerListScreenMachine = () => {
  const { playerList } = useStoreContext();

  const playerListScreenService = useInterpret(PlayerListScreenMachine, {
    services: {
      playerListQuery: () => playerList.methods.queryAsync(),
    },
    guards: {
      hasContent: () => {
        const playerListValue = playerList.methods.getCurrentValue();
        if (Array.isArray(playerListValue)) {
          return playerListValue.length > 0;
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

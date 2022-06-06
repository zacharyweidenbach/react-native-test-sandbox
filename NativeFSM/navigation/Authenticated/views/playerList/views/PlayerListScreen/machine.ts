import { useInterpret, useSelector } from '@xstate/react';
import {
  playerListEvents,
  playerListSubscriptionMachine,
} from '../../../../../../store/players/playerList';
import { createMachine, createSchema } from 'xstate';

import { useStoreContext } from '../../../../../../store/store.provider';

export const machineConfig = {
  tsTypes: {} as import('./machine.typegen').Typegen0,
  schema: {
    events: createSchema<{ type: 'always' }>(),
    services: createSchema<{
      playerListQuery: {
        data: any;
      };
    }>(),
  },
  id: 'PlayerListScreen',
  type: 'parallel' as const,
  initial: 'fetching',
  states: {
    local: {
      initial: 'loading',
      states: {
        loading: {
          initial: 'fetching',
          states: {
            fetching: {
              invoke: {
                src: 'playerListQuery',
                onDone: 'evaluateResult',
                onError: '#PlayerListScreen.local.error',
              },
            },
            evaluateResult: {
              always: [
                {
                  target: '#PlayerListScreen.local.successWithContent',
                  cond: 'hasContent',
                },
                { target: '#PlayerListScreen.local.successNoContent' },
              ],
            },
          },
        },
        successWithContent: { type: 'final' as const },
        successNoContent: { type: 'final' as const },
        error: { type: 'final' as const },
      },
    },
    playerListSubscriber: { invoke: playerListSubscriptionMachine },
  },
  on: { [playerListEvents.RESET]: 'local.loading' },
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
    state.matches('local.loading'),
  );
  const isError = useSelector(playerListScreenService, (state) =>
    state.matches('local.error'),
  );

  return { isLoading, isError };
};

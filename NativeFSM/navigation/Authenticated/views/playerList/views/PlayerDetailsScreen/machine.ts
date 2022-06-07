import { RouteProp, useRoute } from '@react-navigation/native';
import { useInterpret, useSelector } from '@xstate/react';
import { createMachine, createSchema } from 'xstate';

import {
  playerDetailEvents,
  playerDetailSubscription,
  Events,
} from '../../../../../../store/players/playerDetail';
import { useStoreContext } from '../../../../../../store/store.provider';
import { Item, PlayerListStack } from '../../../../../../types';

export const machineConfig = {
  tsTypes: {} as import('./machine.typegen').Typegen0,
  schema: {
    context: createSchema<{ playerId: string }>(),
    events: createSchema<Events>(),
    services: createSchema<{
      playerDetailQuery: {
        data: Item;
      };
    }>(),
  },
  id: 'PlayerDetailScreen',
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        src: 'playerDetailQuery',
        onDone: 'success',
        onError: 'error',
      },
    },
    success: {},
    error: {},
  },
  invoke: playerDetailSubscription,
  on: {
    [playerDetailEvents.RESET]: 'loading',
  },
};

export const PlayerDetailScreenMachine = createMachine(machineConfig);

export const usePlayerDetailScreenMachine = () => {
  const {
    params: { id },
  } = useRoute<RouteProp<PlayerListStack, 'PlayerDetails'>>();
  const { playerDetailQuery } = useStoreContext();
  const playerDetailScreenService = useInterpret(PlayerDetailScreenMachine, {
    context: { playerId: id },
    services: {
      playerDetailQuery: (context) =>
        playerDetailQuery.queryAsync({ playerId: context.playerId }),
    },
  });

  const isLoading = useSelector(playerDetailScreenService, (state) =>
    state.matches('loading'),
  );
  const isError = useSelector(playerDetailScreenService, (state) =>
    state.matches('error'),
  );

  return { isLoading, isError };
};

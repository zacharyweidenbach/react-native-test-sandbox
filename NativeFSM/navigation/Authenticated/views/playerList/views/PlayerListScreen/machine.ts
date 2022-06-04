import { useInterpret, useSelector } from '@xstate/react';
import {
  playerListEvents,
  playerListSubscriptionMachine,
} from '../../../../../../store/players/playerList';
import { createMachine } from 'xstate';

import { useStoreContext } from '../../../../../../store/store.provider';

export const machineConfig = {
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

export const PlayerListScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAUA2BDAnmATgGQEtYAXAZQGMcwwA7AOlQHtz1UHH0ICao6AzMMXIALblADEERjTB1uAN0YBrWWiy5CJClVrsWbJpzH9BIsQgXN0xAtIDaABgC6iUAAdGsAjemuQAD0QAJgBmABY6AHYggA4YyJCARgA2MOSATkTEoIAaEExERLCYugd0hwcAVgro4vCYgF8GvLVsfCIySmp6Jn12Ix4TIVEecVwcRhw6NwxiPkmAWzpWjQ7tbr1Wfq5BgWHzSxYfGkcXJBAPL2O-QIQghzoYysTK4uSMkISwyLyCu++oiEgpUQg4wrEYplEk0Whg2ppOjoelYDBwdrwwPJWABXaxgABKcGxqGI4j8l28thoN2CIXSpRiYLSkUhQMqlV+iCB9NCMSCCUq-KCYQc0JhIBojAgcD8K3aWi6ul6W0M6KGZh45M8lN851uDk5CCyyVK5QcdOFTyK8XFcoR6yVKO2xkxOLxhNgxOIWquVJp-xCdBFT1BkPikUiYXShuFiTooWBWRZkWSWTitrhqwVSM2qIGUB9OupesQAFphYawoGyhUQuzKskWeD0mEM+p5YiNsq2J7yOQ4LAAOreYQAYWkxFo3vOFOuJYQYUqJTB6QbUcjiTDhqBQUBfNecUq6WSDkazRAdrWiuRfV7-dgsAAcoxxzRJ2-C3PQLc0oGUzFQTrYo4mPSsghNBI+UidJQnSSEHCCNt4SvHNuzocZJk-P151TOhMhFOlVwqZJXjCMJt2SEpQkSQiQk+IIgjgyokKzTtHX0LDdW-MtikNct6XKdJjxiGiozSflkhYjsHXoGZ23tbEACNYEoAhFNwTji24hBS14-JEEFCIyPuWIhLSU9JPPS9s26TT-VLaI+MSBC8LKdJIk3cDG0o1smgaIA */
  createMachine({
    tsTypes: {} as import('./machine.typegen').Typegen0,
    schema: {
      events: {} as { type: 'always' },
      services: {} as {
        playerListQuery: {
          data: any;
        };
      },
    },
    ...machineConfig,
  });

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

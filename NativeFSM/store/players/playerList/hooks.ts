import { useMemo } from 'react';
import { InterpreterFrom } from 'xstate';
import { useInterpret, useSelector } from '@xstate/react';

import {
  getQueryServiceMethods,
  QueryMethods,
} from '../../utils/getQueryServiceMethods';
import { PlayerList, playerListQueryMachine } from '.';

export const usePlayerListService = () => {
  return useInterpret(playerListQueryMachine);
};

export const usePlayerListQuery = (
  playerListQueryService: InterpreterFrom<typeof playerListQueryMachine>,
) => {
  return useMemo<QueryMethods<PlayerList>>(
    () => getQueryServiceMethods<PlayerList>(playerListQueryService),
    [playerListQueryService],
  );
};

export const usePlayerList = (
  playerListQueryService: InterpreterFrom<typeof playerListQueryMachine>,
) => {
  return useSelector(
    playerListQueryService,
    (state) => state.context.result as PlayerList | null,
  );
};

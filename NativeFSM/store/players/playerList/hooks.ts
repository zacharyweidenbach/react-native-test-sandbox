import { useMemo } from 'react';
import { InterpreterFrom } from 'xstate';
import { useInterpret, useSelector } from '@xstate/react';

import {
  getQueryServiceMethods,
  QueryMethods,
} from '../../utils/getQueryServiceMethods';
import { PlayerList, playerListQueryMachine } from '.';

export const usePlayerListService = () => {
  const service = useInterpret(playerListQueryMachine);
  return service;
};

export const usePlayerListQuery = (
  playerListQueryService: InterpreterFrom<typeof playerListQueryMachine>,
) => {
  const queryMethods = useMemo<QueryMethods<PlayerList>>(
    () => getQueryServiceMethods<PlayerList>(playerListQueryService),
    [playerListQueryService],
  );
  return queryMethods;
};

export const usePlayerList = (
  playerListQueryService: InterpreterFrom<typeof playerListQueryMachine>,
) => {
  const result = useSelector(
    playerListQueryService,
    (state) => state.context.result as PlayerList | null,
  );
  return result;
};

import { useMemo } from 'react';
import { InterpreterFrom } from 'xstate';
import { useInterpret, useSelector } from '@xstate/react';

import {
  getQueryServiceMethods,
  QueryMethods,
} from '../../utils/getQueryServiceMethods';
import { Player, playerDetailQueryMachine } from '.';

export const usePlayerDetailService = () => {
  const service = useInterpret(playerDetailQueryMachine);
  return service;
};

export const usePlayerDetailQuery = (
  playerDetailQueryService: InterpreterFrom<typeof playerDetailQueryMachine>,
) => {
  const queryMethods = useMemo<QueryMethods<Player>>(
    () => getQueryServiceMethods<Player>(playerDetailQueryService),
    [playerDetailQueryService],
  );
  return queryMethods;
};

export const usePlayerDetail = (
  playerDetailQueryService: InterpreterFrom<typeof playerDetailQueryMachine>,
) => {
  const result = useSelector(
    playerDetailQueryService,
    (state) => state.context.result as Player | null,
  );
  return result;
};

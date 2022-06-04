import { useMemo } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import { InterpreterFrom } from 'xstate';

import {
  getQueryServiceMethods,
  QueryMethods,
} from '../utils/getQueryServiceMethods';
import { AuthData, authQueryMachine } from '.';

export const useAuthService = () => {
  const service = useInterpret(authQueryMachine);
  return service;
};

export const useAuthQuery = (
  authQueryService: InterpreterFrom<typeof authQueryMachine>,
) => {
  const queryMethods = useMemo<QueryMethods<AuthData>>(
    () => getQueryServiceMethods<AuthData>(authQueryService),
    [authQueryService],
  );
  return queryMethods;
};

export const useAuth = (
  authQueryService: InterpreterFrom<typeof authQueryMachine>,
) => {
  const result = useSelector(
    authQueryService,
    (state) => state.context.result as AuthData | null,
  );

  return result;
};

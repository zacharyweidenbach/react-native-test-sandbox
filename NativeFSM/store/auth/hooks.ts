import { useMemo } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import { InterpreterFrom } from 'xstate';

import {
  getQueryServiceMethods,
  QueryMethods,
} from '../utils/getQueryServiceMethods';
import { AuthData, authQueryMachine } from '.';

export const useAuthService = () => {
  return useInterpret(authQueryMachine);
};

export const useAuthQuery = (
  authQueryService: InterpreterFrom<typeof authQueryMachine>,
) => {
  return useMemo<QueryMethods<AuthData>>(
    () => getQueryServiceMethods<AuthData>(authQueryService),
    [authQueryService],
  );
};

export const useAuth = (
  authQueryService: InterpreterFrom<typeof authQueryMachine>,
) => {
  return useSelector(
    authQueryService,
    (state) => state.context.result as AuthData | null,
  );
};

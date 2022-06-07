import { useMemo } from 'react';
import { useInterpret, useSelector } from '@xstate/react';

import {
  getQueryServiceMethods,
  QueryMethods,
} from '../getQueryServiceMethods';
import { QueryMachine, QueryService } from './types';

export const hookGenerator = <T, A>(queryMachine: QueryMachine<T>) => {
  return () => {
    const service = useInterpret(queryMachine);
    const { currentValue, methods } = useCurrentValueAndMethods<T, A>(service);

    return { currentValue, methods };
  };
};

export const useCurrentValueAndMethods = <T, A>(service: QueryService<T>) => {
  const currentValue = useSelector(
    service,
    (state) => state.context.result as T | null,
  );
  const methods = useMemo<QueryMethods<T, A>>(
    () => getQueryServiceMethods<T, A>(service),
    [service],
  );

  return { currentValue, methods };
};

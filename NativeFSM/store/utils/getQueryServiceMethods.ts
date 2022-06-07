import { InterpreterFrom } from 'xstate';

import {
  Config,
  queryMachineWithColdStoreFactory,
} from './queryMachineWithColdStorage';

export type QueryMethods<T, A> = {
  initializeAsync: () => Promise<void>;
  resetAsync: () => Promise<void>;
  queryAsync: (args?: A) => Promise<T>;
  forceQueryAsync: (args: A) => Promise<T>;
  initialize: () => void;
  reset: () => void;
  query: (args: A) => void;
  forceQuery: (args: A) => void;
  getCurrentValue: () => T | null;
};

class QueryServiceHelper<T, A> {
  Return = queryMachineWithColdStoreFactory<T, A>({} as Config);
}
type QueryService<T, A> = InterpreterFrom<QueryServiceHelper<T, A>['Return']>;

export const getQueryServiceMethods = <T, A>(
  queryService: QueryService<T, A>,
) => {
  const initializeAsync = () => {
    queryService.send('INITIALIZE');
    return new Promise<void>((resolve) => {
      queryService.onTransition((state) => {
        if (state.matches('idle') || state.matches('success')) {
          resolve();
        }
      });
    });
  };

  const resetAsync = () => {
    queryService.send('RESET');
    return new Promise<void>((resolve) => {
      queryService.onTransition((state) => {
        if (state.matches('idle')) {
          resolve();
        }
      });
    });
  };

  const queryAsync = (args?: A) => {
    queryService.send('QUERY', args);
    return new Promise<T>((resolve, reject) => {
      queryService.onTransition((state) => {
        if (state.matches('success') && queryService.state.context.result) {
          resolve(queryService.state.context.result as T);
        } else if (state.matches('error')) {
          reject(queryService.state.context.error);
        }
      });
    });
  };

  const forceQueryAsync = (args?: A) => {
    queryService.send('FORCE_QUERY', args);
    return new Promise<T>((resolve, reject) => {
      queryService.onTransition((state) => {
        if (state.matches('success') && queryService.state.context.result) {
          resolve(queryService.state.context.result as T);
        } else if (state.matches('error')) {
          reject(queryService.state.context.error);
        }
      });
    });
  };

  return {
    initializeAsync,
    resetAsync,
    queryAsync,
    forceQueryAsync,
    initialize: () => queryService.send('INITIALIZE'),
    reset: () => queryService.send('RESET'),
    query: (args?: A) => queryService.send('QUERY', args),
    forceQuery: (args?: A) => queryService.send('FORCE_QUERY', args),
    getCurrentValue: () => queryService.state.context.result as T,
  };
};

class GetQueryServiceMethodsHelper<T, A> {
  Return = getQueryServiceMethods<T, A>({} as QueryService<T, A>);
}
export type GetQueryServiceMethods<T, A> = GetQueryServiceMethodsHelper<
  T,
  A
>['Return'];

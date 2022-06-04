import { InterpreterFrom } from 'xstate';

import {
  Options,
  queryMachineWithColdStoreFactory,
} from './queryMachineWithColdStorage';

export type QueryMethods<T> = {
  initializeAsync: () => Promise<void>;
  resetAsync: () => Promise<void>;
  queryAsync: () => Promise<T>;
  forceQueryAsync: () => Promise<T>;
  initialize: () => void;
  reset: () => void;
  query: () => void;
  forceQuery: () => void;
  getCurrentValue: () => T | null;
};

class QueryServiceHelper<T> {
  Return = queryMachineWithColdStoreFactory<T>({} as Options);
}
type QueryService<T> = InterpreterFrom<QueryServiceHelper<T>['Return']>;

export const getQueryServiceMethods = <T>(queryService: QueryService<T>) => {
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

  const queryAsync = () => {
    queryService.send('QUERY');
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

  const forceQueryAsync = () => {
    queryService.send('FORCE_QUERY');
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
    query: () => queryService.send('QUERY'),
    forceQuery: () => queryService.send('FORCE_QUERY'),
    getCurrentValue: () => queryService.state.context.result as T,
  };
};

class GetQueryServiceMethodsHelper<T> {
  Return = getQueryServiceMethods<T>({} as QueryService<T>);
}
export type GetQueryServiceMethods<T> =
  GetQueryServiceMethodsHelper<T>['Return'];

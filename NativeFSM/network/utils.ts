import { interpret } from 'xstate';

import { authedFetchMachine, RETRY_LIMIT } from './authedFetchMachine';

type RequestConfig = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
};

type FetchOptions = {
  retryCount?: number;
};

export const getAuthedFetchService = (
  requestConfig: RequestConfig,
  fetchOptions?: FetchOptions,
) =>
  interpret(
    authedFetchMachine.withContext({
      path: requestConfig.path,
      method: requestConfig.method,
      body: requestConfig.body,
      retryCount:
        fetchOptions && fetchOptions.retryCount
          ? fetchOptions.retryCount
          : RETRY_LIMIT,
      result: null,
      error: null,
    }),
  );
export const fetchPromiseFromFetchService = (fetchService: any) =>
  new Promise((resolve, reject) => {
    fetchService.onTransition((state: any) => {
      if (state.matches('success')) {
        resolve(state.context.result);
      } else if (state.matches('error')) {
        reject(state.context.error);
      }
    });

    fetchService.start();
  });

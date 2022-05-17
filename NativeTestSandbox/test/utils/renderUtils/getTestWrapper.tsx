import * as React from 'react';
import '@testing-library/jest-native/extend-expect';
import '@testing-library/react-native';
import {
  QueryClient,
  QueryClientProvider,
  QueryKey,
  setLogger,
} from 'react-query';
import { NavigationContainer } from '@react-navigation/native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { cloneDeep } from 'lodash';

type TestWrapperOptions = {
  RQCacheOverrides: {
    queryKey: QueryKey;
    queryValue: any;
  }[];
};

export const getTestWrapper = <TProps,>(
  options: TestWrapperOptions,
): React.FunctionComponent<TProps> => {
  const { RQCacheOverrides } = options;
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  if (RQCacheOverrides?.length) {
    RQCacheOverrides.forEach(({ queryKey, queryValue }) => {
      testQueryClient.setQueryData(queryKey, cloneDeep(queryValue));
    });
  }

  // disable react-query console error logging for tests
  setLogger({
    log: console.log,
    warn: console.warn,
    error: () => {},
  });

  return ({ children }) => (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <QueryClientProvider client={testQueryClient}>
          <NavigationContainer>{children}</NavigationContainer>
        </QueryClientProvider>
      </ApplicationProvider>
    </>
  );
};

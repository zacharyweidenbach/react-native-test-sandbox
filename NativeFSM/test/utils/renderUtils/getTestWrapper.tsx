import * as React from 'react';
import '@testing-library/jest-native/extend-expect';
import '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';

import { getTestStoreProvider } from './getTestStoreProvider';
import { getTestStoreHandler } from '../getTestStoreHandler';

type TestWrapperOptions = {
  testStoreHandler?: ReturnType<typeof getTestStoreHandler>;
};

export const getTestWrapper = async <TProps,>(
  options: TestWrapperOptions,
): Promise<React.FunctionComponent<TProps>> => {
  const TestStoreProvider = await getTestStoreProvider(options);

  return ({ children }) => (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <TestStoreProvider>
          <NavigationContainer>{children}</NavigationContainer>
        </TestStoreProvider>
      </ApplicationProvider>
    </>
  );
};

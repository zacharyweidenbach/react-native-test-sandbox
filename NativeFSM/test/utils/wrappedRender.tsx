import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

import { MockedNavigator } from './renderUtils/MockedNavigator';
import { getTestWrapper } from './renderUtils/getTestWrapper';
import { getTestStoreHandler } from './getTestStoreHandler';

type WrappedRenderOptions = {
  initialParams?: { [key: string]: any };
  renderOptions?: RenderOptions;
  testStoreHandler?: ReturnType<typeof getTestStoreHandler>;
};

const defaultOptions = {
  initialParams: {},
  renderOptions: {},
};

export const wrappedRender = async (
  screen: React.ComponentType<any>,
  optionsOverrides: WrappedRenderOptions = {},
) => {
  const { initialParams, renderOptions, ...testWrapperOptions } = {
    ...defaultOptions,
    ...optionsOverrides,
  };
  const Wrapper = await getTestWrapper(testWrapperOptions);

  const { rerender, ...result } = render(
    <MockedNavigator screen={screen} initialParams={initialParams} />,
    {
      wrapper: Wrapper,
      ...renderOptions,
    },
  );

  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(<Wrapper>{rerenderUi}</Wrapper>),
  };
};

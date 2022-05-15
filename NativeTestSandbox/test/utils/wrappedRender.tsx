import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryKey } from 'react-query';

import { MockedNavigator } from './renderUtils/MockedNavigator';
import { getTestWrapper } from './renderUtils/getTestWrapper';

type WrappedRenderOptions = {
  initialParams?: { [key: string]: any };
  renderOptions?: RenderOptions;
  RQCacheOverrides?: {
    queryKey: QueryKey;
    queryValue: any;
  }[];
};

const defaultOptions = {
  initialParams: {},
  renderOptions: {},
  RQCacheOverrides: [],
};

export const wrappedRender = (
  screen: React.ComponentType<any>,
  optionsOverrides: WrappedRenderOptions = {},
) => {
  const { initialParams, renderOptions, ...testWrapperOptions } = {
    ...defaultOptions,
    ...optionsOverrides,
  };
  const Wrapper = getTestWrapper(testWrapperOptions);

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

import * as React from 'react';
import '@testing-library/jest-native/extend-expect';
import { waitFor } from '@testing-library/react-native';

import * as useFetchQueryModule from '../../../../utils/useFetchQuery';
import { mockItemsEndpoint, itemBuilder } from '../../../../test/mocks/item';

import {
  wrappedRender,
  MockedNavigator,
} from '../../../../test/utils/testHelpers';
import { ConventionalListScreen } from '.';

describe('ConventionalListScreen', () => {
  beforeEach(() => {
    // https://github.com/facebook/jest/issues/6434
    jest.useFakeTimers();
  });

  it('should be loading when fetching', () => {
    const spy = jest.spyOn(useFetchQueryModule, 'useFetchQuery');
    spy.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    } as any);

    const { getByA11yLabel } = wrappedRender(
      <MockedNavigator screen={ConventionalListScreen} />,
    );

    expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
  });

  it('should show error if something goes wrong', () => {
    const spy = jest.spyOn(useFetchQueryModule, 'useFetchQuery');
    spy.mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    } as any);

    const { getByText } = wrappedRender(
      <MockedNavigator screen={ConventionalListScreen} />,
    );

    expect(getByText('Whoops! Something went wrong.')).toBeTruthy();
  });

  it('should show data when fetched', async () => {
    const item = itemBuilder();
    const scope = mockItemsEndpoint([item]);

    const { getByText } = wrappedRender(
      <MockedNavigator screen={ConventionalListScreen} />,
    );

    waitFor(() => expect(scope).toHaveBeenCalledTimes(1)).then(() => {
      expect(getByText(`${item.firstName} ${item.lastName}`)).toBeTruthy();
      expect(getByText(`Team Colors: ${item.teamColor}`)).toBeTruthy();
    });
  });
});

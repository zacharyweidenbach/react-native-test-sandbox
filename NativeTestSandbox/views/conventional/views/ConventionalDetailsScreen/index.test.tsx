import * as React from 'react';
import '@testing-library/jest-native/extend-expect';
import '@testing-library/react-native';

import * as useFetchQueryModule from '../../../../utils/useFetchQuery';

import {
  wrappedRender,
  MockedNavigator,
} from '../../../../test/utils/testHelpers';
import { ConventionalDetailsScreen } from '.';

describe('ConventionalDetailsScreen', () => {
  beforeAll(() => {
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
      <MockedNavigator screen={ConventionalDetailsScreen} />,
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
      <MockedNavigator screen={ConventionalDetailsScreen} />,
    );

    expect(getByText('Whoops! Something went wrong.')).toBeTruthy();
  });

  it('should show data when fetched', () => {
    const spy = jest.spyOn(useFetchQueryModule, 'useFetchQuery');
    spy.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        id: 'id',
        firstName: 'John',
        lastName: 'Doe',
        teamColor: 'blue',
      },
    } as any);

    const { getByText } = wrappedRender(
      <MockedNavigator screen={ConventionalDetailsScreen} />,
    );

    expect(getByText('Player Details')).toBeTruthy();
    expect(getByText('First Name: John')).toBeTruthy();
    expect(getByText('Last Name: Doe')).toBeTruthy();
    expect(getByText('Team Color: blue')).toBeTruthy();
  });
});

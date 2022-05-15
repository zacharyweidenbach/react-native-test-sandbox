import '@testing-library/jest-native/extend-expect';
import { waitFor } from '@testing-library/react-native';

import * as useFetchQueryModule from '../../../../utils/useFetchQuery';
import { mockItemEndpoint, itemBuilder } from '../../../../test/mocks/item';

import { wrappedRender } from '../../../../test/utils/wrappedRender';
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

    const { getByA11yLabel } = wrappedRender(ConventionalDetailsScreen);

    expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
  });

  it('should show error if something goes wrong', () => {
    const spy = jest.spyOn(useFetchQueryModule, 'useFetchQuery');
    spy.mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    } as any);

    const { getByText } = wrappedRender(ConventionalDetailsScreen);

    expect(getByText('Whoops! Something went wrong.')).toBeTruthy();
  });

  it('should show data when fetched', () => {
    const item = itemBuilder();
    const scope = mockItemEndpoint(item);

    const { getByText } = wrappedRender(ConventionalDetailsScreen, {
      initialParams: { id: item.id },
    });

    waitFor(() => expect(scope).toHaveBeenCalledTimes(1)).then(() => {
      expect(getByText('Player Details')).toBeTruthy();
      expect(getByText(`First Name: ${item.firstName}`)).toBeTruthy();
      expect(getByText(`Last Name: ${item.lastName}`)).toBeTruthy();
      expect(getByText(`Team Color: ${item.teamColor}`)).toBeTruthy();
    });
  });
});

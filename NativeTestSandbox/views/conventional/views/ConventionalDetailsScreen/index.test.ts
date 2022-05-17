import '@testing-library/jest-native/extend-expect';
import { cleanup } from '@testing-library/react-native';
import nock from 'nock';

import { itemBuilder } from '../../../../test/mocks/item';

import { wrappedRender } from '../../../../test/utils/wrappedRender';
import { ConventionalDetailsScreen } from '.';

describe('ConventionalDetailsScreen', () => {
  afterEach(() => {
    nock.cleanAll();
    cleanup();
  });

  it('should be loading when fetching', () => {
    const item = itemBuilder();
    nock('http://localhost:9000').get(`/items/${item.id}`).reply(200, item);

    const { getByA11yLabel } = wrappedRender(ConventionalDetailsScreen, {
      initialParams: { id: item.id },
    });

    expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
  });

  it('should show error if something goes wrong', async () => {
    const item = itemBuilder();
    nock('http://localhost:9000')
      .get(`/items/${item.id}`)
      .reply(500, { error: { message: 'Something went wrong' } });

    const { findByText } = wrappedRender(ConventionalDetailsScreen, {
      initialParams: { id: item.id },
    });

    expect(await findByText('Whoops! Something went wrong.')).toBeTruthy();
  });

  it('should show data when fetched', async () => {
    const item = itemBuilder();
    nock('http://localhost:9000').get(`/items/${item.id}`).reply(200, item);

    const { getByText, findByText } = wrappedRender(ConventionalDetailsScreen, {
      initialParams: { id: item.id },
    });

    expect(await findByText('Player Details')).toBeTruthy();
    expect(getByText(`First Name: ${item.firstName}`)).toBeTruthy();
    expect(getByText(`Last Name: ${item.lastName}`)).toBeTruthy();
    expect(getByText(`Team Color: ${item.teamColor}`)).toBeTruthy();
  });
});

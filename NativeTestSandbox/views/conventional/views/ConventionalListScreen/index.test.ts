import '@testing-library/jest-native/extend-expect';
import { cleanup } from '@testing-library/react-native';
import nock from 'nock';

import { itemBuilder } from '../../../../test/mocks/item';

import { wrappedRender } from '../../../../test/utils/wrappedRender';
import { ConventionalListScreen } from '.';

describe('ConventionalListScreen', () => {
  afterEach(() => {
    nock.cleanAll();
    cleanup();
  });

  it('should be loading when fetching', async () => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);

    const { getByA11yLabel } = wrappedRender(ConventionalListScreen);

    expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
  });

  it('should show error if something goes wrong', async () => {
    nock('http://localhost:9000')
      .get('/items')
      .reply(500, { error: { message: 'Something went wrong' } });

    const { findByText } = wrappedRender(ConventionalListScreen);

    expect(await findByText('Whoops! Something went wrong.')).toBeTruthy();
  });

  it('should show data when fetched', async () => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);

    const { findByText, getByText } = wrappedRender(ConventionalListScreen);

    expect(await findByText(`${item.firstName} ${item.lastName}`)).toBeTruthy();
    expect(getByText(`Team Colors: ${item.teamColor}`)).toBeTruthy();
  });

  it('should zero content placeholder', async () => {
    nock('http://localhost:9000').get('/items').reply(200, []);

    const { findByText } = wrappedRender(ConventionalListScreen);

    expect(await findByText('Nothing Here!')).toBeTruthy();
  });
});

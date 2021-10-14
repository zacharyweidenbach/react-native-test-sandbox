import * as React from 'react';
import '@testing-library/jest-native/extend-expect';
import { render } from '@testing-library/react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';

import { MVCListScreenView } from './view';
import { itemBuilder } from '../../../../test/mocks/item';

describe('MVCListScreenView', () => {
  it('should be loading when loading is true', () => {
    const { getByA11yLabel } = render(
      <>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
          <MVCListScreenView
            isLoading={true}
            isError={false}
            data={[]}
            onListItemPress={() => {}}
          />
        </ApplicationProvider>
      </>,
    );

    expect(getByA11yLabel('Loading Indicator')).toBeTruthy();
  });

  it('should be error when error is true', () => {
    const { getByText } = render(
      <>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
          <MVCListScreenView
            isLoading={false}
            isError={true}
            data={[]}
            onListItemPress={() => {}}
          />
        </ApplicationProvider>
      </>,
    );

    expect(getByText('Whoops! Something went wrong.')).toBeTruthy();
  });

  it('should show data', () => {
    const item = itemBuilder();
    const { getByText } = render(
      <>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
          <MVCListScreenView
            isLoading={false}
            isError={false}
            data={[item]}
            onListItemPress={() => {}}
          />
        </ApplicationProvider>
      </>,
    );

    expect(getByText(`${item.firstName} ${item.lastName}`)).toBeTruthy();
    expect(getByText(`Team Colors: ${item.teamColor}`)).toBeTruthy();
  });
});

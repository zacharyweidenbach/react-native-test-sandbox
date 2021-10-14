import React from 'react';

import { MCVListScreenModelGetter } from './model';
import { MVCListScreenControllerGetter } from './controller';
import { MVCListScreenView } from './view';

const model = MCVListScreenModelGetter(fetch)();
const useController = MVCListScreenControllerGetter(model);

export const MVCListScreen = () => {
  const { isLoading, isError, data, onListItemPress } = useController();

  return (
    <MVCListScreenView
      isLoading={isLoading}
      isError={isError}
      data={data}
      onListItemPress={onListItemPress}
    />
  );
};

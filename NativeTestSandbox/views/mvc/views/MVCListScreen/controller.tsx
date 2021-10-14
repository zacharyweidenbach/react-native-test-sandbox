import React from 'react';
import { useForceUpdate } from '../../../../utils/useForceUpdate';
import { Model } from './model';

export const MVCListScreenControllerGetter = (model: Model) => () => {
  const forceUpdate = useForceUpdate();

  // on mount and cleanup
  React.useEffect(() => {
    model.onMount(forceUpdate);
    return () => model.onUnmount();
  }, [forceUpdate]);

  return {
    isLoading: model.getState().isLoading,
    isError: model.getState().isError,
    data: model.getState().data,
    onListItemPress: () => {},
  };
};

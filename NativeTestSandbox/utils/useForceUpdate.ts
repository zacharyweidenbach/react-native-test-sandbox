import React from 'react';

export const useForceUpdate = () => {
  const [, updateState] = React.useState();
  return React.useCallback(() => {
    return updateState({} as any);
  }, []);
};

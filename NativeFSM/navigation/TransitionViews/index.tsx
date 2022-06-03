import * as React from 'react';

import { usePrimaryMachineContext } from '../primaryMachine.provider';
import { LoggingIn } from './LoggingIn';
import { LoggingOut } from './LoggingOut';
import { Bootstrap } from './Bootstrap';

export const TransitionViews: React.FC = ({ children }) => {
  const { isBootstrapping, isLoggingIn, isLoggingOut } =
    usePrimaryMachineContext();

  if (isBootstrapping) {
    return <Bootstrap />;
  } else if (isLoggingIn) {
    return <LoggingIn />;
  } else if (isLoggingOut) {
    return <LoggingOut />;
  } else {
    return <>{children}</>;
  }
};

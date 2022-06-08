import React, { FC, createContext, useContext } from 'react';

import { usePrimaryMachine } from './primaryMachine';

type PrimaryMachineContextType = {
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
};

const PrimaryMachineContext = createContext<PrimaryMachineContextType>(
  {} as PrimaryMachineContextType,
);

export const usePrimaryMachineContext = () => {
  return useContext(PrimaryMachineContext);
};

export const PrimaryMachineProvider: FC = ({ children }) => {
  const {
    isBootstrapping,
    isLoggingIn,
    isLoggingOut,
    isAuthenticated,
    isUnauthenticated,
    handleLogin,
    handleLogout,
  } = usePrimaryMachine();

  return (
    <PrimaryMachineContext.Provider
      value={{
        isBootstrapping,
        isLoggingIn,
        isLoggingOut,
        isAuthenticated,
        isUnauthenticated,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </PrimaryMachineContext.Provider>
  );
};

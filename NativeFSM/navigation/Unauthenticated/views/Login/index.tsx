import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Layout } from '@ui-kitten/components';

import { usePrimaryMachineContext } from '../../../../navigation/primaryMachine.provider';

export const LoginScreen = () => {
  const { handleLogin } = usePrimaryMachineContext();

  return (
    <Layout style={styles.container} level="1">
      <Button
        onPress={() => handleLogin()}
        style={styles.button}
        appearance="outline"
      >
        Login
      </Button>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  button: {
    marginLeft: 10,
    marginBottom: 650,
  },
});

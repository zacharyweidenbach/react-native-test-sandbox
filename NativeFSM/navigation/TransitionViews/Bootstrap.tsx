import React from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';

import { LoadingIndicator } from '../../components/LoadingIndicator';

export const Bootstrap = () => {
  return (
    <Layout style={styles.container} level="1">
      <Text>Bootstrapping App</Text>
      <Text>Please wait...</Text>
      <LoadingIndicator />
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
});

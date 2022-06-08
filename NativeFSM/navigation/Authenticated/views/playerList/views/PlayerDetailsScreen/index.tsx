import React from 'react';
import { Text, Card } from '@ui-kitten/components';

import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { usePlayerDetailScreenMachine } from './machine';
import { useStoreContext } from '../../../../../../store/store.provider';

export const PlayerDetailsScreen = () => {
  const { isLoading, isError } = usePlayerDetailScreenMachine();
  const { playerDetail } = useStoreContext();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <Text>Whoops! Something went wrong.</Text>;
  }

  return (
    <Card header={() => <Text category="h2">Player Details</Text>}>
      <Text>{`First Name: ${playerDetail.currentValue?.firstName}`}</Text>
      <Text>{`Last Name: ${playerDetail.currentValue?.lastName}`}</Text>
      <Text>{`Team Color: ${playerDetail.currentValue?.teamColor}`}</Text>
    </Card>
  );
};

import React from 'react';
import { Text, Card } from '@ui-kitten/components';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useMachine } from '@xstate/react';

import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { PlayerListStack } from '../../../../types';
import { PlayerDetailsScreenMachine } from './machine';

export const PlayerDetailsScreen = () => {
  const {
    params: { id },
  } = useRoute<RouteProp<PlayerListStack, 'PlayerDetails'>>();

  const [state, send] = useMachine(PlayerDetailsScreenMachine);

  const isIdle = state.matches('idle');
  const isLoading = state.matches('idle') || state.matches('loading');
  const isError = state.matches('error');
  const data = state.context.result;

  React.useEffect(() => {
    if (isIdle) {
      send('FETCH', { id });
    }
  }, [send, isIdle]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <Text>Whoops! Something went wrong.</Text>;
  }

  return (
    <Card header={() => <Text category="h2">Player Details</Text>}>
      <Text>{`First Name: ${data?.firstName}`}</Text>
      <Text>{`Last Name: ${data?.lastName}`}</Text>
      <Text>{`Team Color: ${data?.teamColor}`}</Text>
    </Card>
  );
};

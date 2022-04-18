import React from 'react';
import { List, ListItem, Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { useMachine } from '@xstate/react';

import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { fetchMachine } from './stateMachine';

export const StateMachineListScreen = () => {
  const [state, send] = useMachine(fetchMachine);
  const navigation = useNavigation();

  const isLoading = state.value === 'idle' || state.value === 'loading';
  const isError = state.value === 'error';
  const isIdle = state.value === 'idle';
  const data = state.context.result;

  React.useEffect(() => {
    if (isIdle) {
      send('FETCH');
    }
  }, [send, isIdle]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <Text>Whoops! Something went wrong.</Text>;
  }

  return (
    <List
      data={data}
      renderItem={({ item }) => (
        <ListItem
          title={`${item.firstName} ${item.lastName}`}
          description={`Team Colors: ${item.teamColor}`}
          onPress={() =>
            navigation.navigate('StateMachineDetails', { id: item.id })
          }
        />
      )}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>Nothing Here!</Text>}
    />
  );
};

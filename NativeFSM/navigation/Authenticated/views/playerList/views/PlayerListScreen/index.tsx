import React from 'react';
import { List, ListItem, Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';

import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { useStoreContext } from '../../../../../../store/store.provider';
import { usePlayerListScreenMachine } from './machine';

export const PlayerListScreen = () => {
  const navigation = useNavigation();
  const { isLoading, isError } = usePlayerListScreenMachine();
  const { playerList } = useStoreContext();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <Text>Whoops! Something went wrong.</Text>;
  }

  return (
    <List
      data={playerList}
      renderItem={({ item }) => (
        <ListItem
          title={`${item.firstName} ${item.lastName}`}
          description={`Team Colors: ${item.teamColor}`}
          onPress={() => navigation.navigate('PlayerDetails', { id: item.id })}
        />
      )}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>Nothing Here!</Text>}
    />
  );
};

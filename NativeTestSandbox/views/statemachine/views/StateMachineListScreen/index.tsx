import React from 'react';
import { List, ListItem, Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';

import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { Item } from '../../../../types';

export const StateMachineListScreen = () => {
  const navigation = useNavigation();
  const isLoading = false;
  const isError = false;
  const data = [] as Item[];

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

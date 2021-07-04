import React from 'react';
import { useQuery } from 'react-query';
import { List, ListItem, Text, Spinner } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';

import { Item } from '../../types';

export const ConventionalListScreen = () => {
  const { isLoading, error, data } = useQuery<Item[]>('ConventionalList', () =>
    fetch('http://localhost:9000/items').then((res) => res.json()),
  );
  const navigation = useNavigation();

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
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
            navigation.navigate('ConventionalDetails', { id: item.id })
          }
        />
      )}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>Nothing Here!</Text>}
    />
  );
};

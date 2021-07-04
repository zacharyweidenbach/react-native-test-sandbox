import React from 'react';
import { useQuery } from 'react-query';
import { List, ListItem, Text, Spinner } from '@ui-kitten/components';

type Item = {
  id: string;
  teamColor: string;
  createdAt: string;
  firstName: string;
  lastName: string;
};

export const ConventionalListScreen = () => {
  const { isLoading, error, data } = useQuery<Item[]>('repoData', () =>
    fetch('http://localhost:9000/items').then((res) => res.json()),
  );

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
        />
      )}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>Nothing Here!</Text>}
    />
  );
};

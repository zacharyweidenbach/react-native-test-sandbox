import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { List, ListItem, Text, Spinner } from '@ui-kitten/components';

const queryClient = new QueryClient();

type Item = {
  id: string;
  teamColor: string;
  createdAt: string;
  firstName: string;
  lastName: string;
};

export const ConventionalListScreen = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConventionalListScreenContents />
    </QueryClientProvider>
  );
};

const ConventionalListScreenContents = () => {
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

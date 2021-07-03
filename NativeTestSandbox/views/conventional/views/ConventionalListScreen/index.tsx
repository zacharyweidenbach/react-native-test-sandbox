import React, { FC } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

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
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Whoops! Something went wrong.</Text>;
  }

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Item item={item} />}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>Nothing Here!</Text>}
    />
  );
};

const Item: FC<{ item: Item }> = ({ item }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{`First Name: ${item.firstName}`}</Text>
      <Text>{`Last Name: ${item.lastName}`}</Text>
      <Text>{`Team Color: ${item.teamColor}`}</Text>
    </View>
  );
};

import React from 'react';
import { useQuery } from 'react-query';
import { Text, Spinner, Card } from '@ui-kitten/components';
import { RouteProp, useRoute } from '@react-navigation/native';

import { ConventionalStackList, Item } from '../../types';

export const ConventionalDetailsScreen = () => {
  const {
    params: { id },
  } = useRoute<RouteProp<ConventionalStackList, 'ConventionalDetails'>>();

  const { isLoading, error, data } = useQuery<Item>('ConventionalDetails', () =>
    fetch(`http://localhost:9000/items/${id}`).then((res) => res.json()),
  );

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
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

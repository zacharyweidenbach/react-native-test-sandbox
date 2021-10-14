import React from 'react';
import { Text, Card } from '@ui-kitten/components';
import { RouteProp, useRoute } from '@react-navigation/native';

import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { useFetchQuery } from '../../../../utils/useFetchQuery';
import { ConventionalStackList, Item } from '../../../../types';

export const ConventionalDetailsScreen = () => {
  const {
    params: { id },
  } = useRoute<RouteProp<ConventionalStackList, 'ConventionalDetails'>>();

  const { isLoading, isError, data } = useFetchQuery<Item>(
    'ConventionalDetails',
    `items/${id}`,
  );

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

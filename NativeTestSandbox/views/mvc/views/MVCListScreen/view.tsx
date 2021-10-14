import React, { FC } from 'react';
import { List, ListItem, Text } from '@ui-kitten/components';

import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { Item } from '../../../../types';

export type Props = {
  isLoading: boolean;
  isError: boolean;
  data: Item[];
  onListItemPress: (event: any) => void;
};

export const MVCListScreenView: FC<Props> = ({
  isLoading,
  isError,
  data,
  onListItemPress,
}) => {
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
          onPress={onListItemPress}
        />
      )}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>Nothing Here!</Text>}
    />
  );
};

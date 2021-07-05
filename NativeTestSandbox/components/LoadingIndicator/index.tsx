import React, { FC } from 'react';
import { View } from 'react-native';
import { Spinner } from '@ui-kitten/components';

export const LoadingIndicator: FC<{ accessibilityLabel?: string }> = ({
  accessibilityLabel = 'Loading Indicator',
  ...rest
}) => {
  return (
    <View accessibilityLabel={accessibilityLabel}>
      <Spinner {...rest} />
    </View>
  );
};

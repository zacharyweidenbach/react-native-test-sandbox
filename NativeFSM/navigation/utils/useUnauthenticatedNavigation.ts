import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

export type UnauthenticatedStackType = {
  Login: undefined;
  LoggingIn: undefined;
};

export const useUnauthenticatedNavigation: () => StackNavigationProp<UnauthenticatedStackType> =
  useNavigation;

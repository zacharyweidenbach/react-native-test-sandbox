import { StackNavigationProp } from '@react-navigation/stack';
import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';

import { UnauthenticatedStackType } from './useUnauthenticatedNavigation';
import { AuthenticatedStackType } from './useAuthenticatedNavigation';

export type RootStackList = {
  Unauthenticated: NavigatorScreenParams<UnauthenticatedStackType>;
  Authenticated: NavigatorScreenParams<AuthenticatedStackType>;
};

export const useRootNavigation: () => StackNavigationProp<RootStackList> =
  useNavigation;

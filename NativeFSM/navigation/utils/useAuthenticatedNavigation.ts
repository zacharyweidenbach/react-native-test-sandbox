import { StackNavigationProp } from '@react-navigation/stack';
import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';

export type AuthenticatedStackType = {
  PlayerList: NavigatorScreenParams<PlayerListType>;
  Account: NavigatorScreenParams<AccountType>;
};

export type PlayerListType = {
  PlayerList: undefined;
  PlayerDetails: { id: string };
};

export type AccountType = {
  Account: undefined;
};

export const useAuthenticatedNavigation: () => StackNavigationProp<AuthenticatedStackType> =
  useNavigation;

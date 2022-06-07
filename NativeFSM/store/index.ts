import { accessTokenQueryManager } from './auth/accessToken';
import { playerListQueryManager } from './players/playerList';
import { playerDetailQueryManager } from './players/playerDetail';

export default {
  accessToken: accessTokenQueryManager,
  playerList: playerListQueryManager,
  playerDetail: playerDetailQueryManager,
};

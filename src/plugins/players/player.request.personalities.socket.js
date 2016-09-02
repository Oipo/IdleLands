
import { GameState } from '../../core/game-state';

export const event = 'plugin:player:request:personalities';
export const socket = (socket) => {

  const requestpersonalities = async() => {
    if(!socket.authToken) return;

    const { playerName } = socket.authToken;
    if(!playerName) return;

    const player = GameState.getInstance().getPlayer(playerName);
    if(!player) return;
    player._updatePersonalities();
  };

  socket.on(event, requestpersonalities);
};
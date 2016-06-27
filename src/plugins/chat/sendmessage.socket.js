
import _ from 'lodash';

import { primus } from '../../../primus/server';
import { GameState } from '../../core/game-state';
import { SETTINGS } from '../../static/settings';

const GENERAL_ROUTE = 'chat:channel:General';

const extChat = new (require(`./external.chat.${SETTINGS.externalChat}`).ExternalChatMechanism)(primus, GENERAL_ROUTE);

export const event = 'plugin:chat:sendmessage';
export const socket = (socket, primus) => {

  // always join the general chat channel
  socket.join(GENERAL_ROUTE);

  const sendmessage = async ({ text, channel, route, playerName }) => {
    if(!socket.authToken) return;

    const player = GameState.retrievePlayer(playerName);

    text = _.truncate(text, { length: SETTINGS.chatMessageMaxLength, omission: ' [truncated]' }).trim();
    if(!text || !player || !playerName) return;

    const messageObject = { text, channel, route, title: player.title, playerName, event };

    if(_.includes(route, ':pm:')) {
      const users = route.split(':')[2].split('|');
      primus.forEach(spark => {
        if(!_.includes(users, spark.playerName)) return;
        spark.write(messageObject);
      });
    } else {
      primus.room(route).write(messageObject);

      if(route === GENERAL_ROUTE) {
        extChat.sendMessage(messageObject);
      }
    }
  };

  socket.on(event, sendmessage);
};
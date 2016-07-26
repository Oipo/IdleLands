
import _ from 'lodash';

import Chance from 'chance';
const chance = new Chance();

import { GameState } from '../../core/game-state';
import { StringGenerator } from '../../shared/string-generator';

import { emitter } from '../../plugins/players/_emitter';
import { PartyLeave } from '../events/eventtypes/PartyLeave';

import { MessageCategories } from '../../shared/adventure-log';
import { MessageParser } from '../../plugins/events/messagecreator';

export class Party {
  constructor({ leader }) {
    this.players = [];
    this.name = this.generateName();
    GameState.getInstance().parties[this.name] = this;

    this.playerJoin(leader);
  }

  generateName() {
    let name = null;
    do {
      name = StringGenerator.party();
    } while(GameState.getInstance().parties[name]);

    return name;
  }

  allowPlayerToLeaveParty(player) {
    PartyLeave.operateOn(player);
  }

  setPartySteps(player) {
    player.partySteps = chance.integer({ min: 50, max: 200 });
  }

  playerTakeStep(player) {
    if(!player.partySteps) this.setPartySteps(player);
    player.partySteps--;

    if(player.partySteps <= 0) {
      this.allowPlayerToLeaveParty(player);
    }
  }

  playerJoin(player) {
    this.players.push(player);
    player.partyName = this.name;
    player.$statistics.incrementStat('Character.Party.Join');
    player.partySteps = 0;
    if(this.players.length > 1) {
      this.teleportNear(player, this.players[this.players.length-2]);
    }
  }

  playerLeave(player, disbanding = false) {
    this.players = _.without(this.players, player);
    player.partyName = null;
    player.$statistics.incrementStat('Character.Party.Leave');
    player.choices = _.reject(player.choices, c => c.event === 'PartyLeave');

    if(!disbanding) {
      emitter.emit('player:event', {
        affected: [player],
        eventText: MessageParser.stringFormat('%player has left %partyName.', player, { partyName: this.name }),
        category: MessageCategories.PARTY
      });
    }

    if((this.players.length <= 1 && !disbanding) || player === this.leader) this.disband();
  }

  get leader() {
    return this.players[0];
  }

  getFollowTarget(player) {
    if(player === this.leader) return;
    return this.players[_.indexOf(this.players, player)-1];
  }

  teleportNear(me, target) {
    me.x = target.x;
    me.y = target.y;
    me.map = target.map;
  }

  disband() {
    emitter.emit('player:event', {
      affected: this.players,
      eventText: MessageParser.stringFormat('%player has disbanded %partyName.', this.leader, { partyName: this.name }),
      category: MessageCategories.PARTY
    });

    _.each(this.players, p => this.playerLeave(p, true));
    GameState.getInstance().parties[this.name] = null;
    delete GameState.getInstance().parties[this.name];
  }

}

import { Effect } from '../effect';

export class Vampire extends Effect {
  constructor(opts) {
    if(!opts.duration) opts.duration = 3;
    super(opts);
  }

  affect() {
    this._emitMessage(this.target, '%player is slowly being drained of %hisher hp!');
  }

  tick() {
    super.tick();
    const damage = Math.round(this.target._hp.maximum * 0.01 * this.potency);
    const casterAlive = this.origin.ref.hp !== 0;

    this._emitMessage(this.target, `%player suffered ${damage} damage from %casterName's %spellName! ${casterAlive ? '%casterName leeched it back!' : ''}`);

    this.dealDamage(this.target, damage);
    if(casterAlive) {
      this.origin.ref._hp.add(damage);
    }
  }
}
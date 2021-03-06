
import { Profession } from '../base/profession';

export class MagicalMonster extends Profession {

  static baseHpPerLevel = Profession.baseHpPerLevel;
  static baseMpPerLevel = Profession.baseMpPerLevel + 15;

  static baseMpPerInt = 20;

  static baseConPerLevel = 2;
  static baseDexPerLevel = 2;
  static baseAgiPerLevel = 2;
  static baseStrPerLevel = 2;
  static baseIntPerLevel = 2;
}
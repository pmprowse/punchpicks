export interface Fighter {
  name: string;
  id: string;
}

export interface Fight {
  id: string;
  weightClass: string;
  fighter1: Fighter;
  fighter2: Fighter;
}

export interface FightCard {
  title: string;
  fights: Fight[];
}

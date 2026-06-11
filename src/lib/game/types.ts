export type CardRarity = "common" | "rare" | "epic";

export type CardEffectType =
  | "bonus_hp"
  | "bonus_attack"
  | "bonus_defense"
  | "bonus_speed"
  | "bonus_crit_chance"
  | "first_strike_damage"
  | "low_hp_heal";

export type CardDefinition = {
  id: string;
  name: string;
  emoji: string;
  rarity: CardRarity;
  effectType: CardEffectType;
  effectValue: number;
  description: string;
};

export type CombatStats = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
};

export type CharacterLoadout = {
  id: string;
  ownerUserId: string;
  emoji: string;
  name: string;
  level: number;
  xp: number;
  gold: number;
  baseStats: CombatStats;
  deck: CardDefinition[];
};

export type FighterSide = "attacker" | "defender";

export type BattleParticipantSnapshot = {
  characterId: string;
  ownerUserId: string;
  emoji: string;
  name: string;
  level: number;
  power: number;
  baseStats: CombatStats;
  finalStats: CombatStats;
  cards: Array<Pick<CardDefinition, "id" | "name" | "emoji" | "rarity">>;
};

export type BattleEvent =
  | {
      type: "battle_started";
      round: 0;
      attacker: BattleParticipantSnapshot;
      defender: BattleParticipantSnapshot;
    }
  | {
      type: "attack";
      round: number;
      actor: FighterSide;
      target: FighterSide;
      damage: number;
      critical: boolean;
      targetHpAfter: number;
    }
  | {
      type: "card_effect";
      round: number;
      actor: FighterSide;
      target?: FighterSide;
      cardId: string;
      cardName: string;
      effectType: CardEffectType;
      value: number;
      targetHpAfter?: number;
      actorHpAfter?: number;
    }
  | {
      type: "fighter_defeated";
      round: number;
      loser: FighterSide;
      winner: FighterSide;
    }
  | {
      type: "battle_finished";
      round: number;
      winner: FighterSide;
      loser: FighterSide;
      attackerHp: number;
      defenderHp: number;
    };

export type BattleResult = {
  rulesVersion: number;
  seed: string;
  rounds: number;
  winnerSide: FighterSide;
  loserSide: FighterSide;
  attackerSnapshot: BattleParticipantSnapshot;
  defenderSnapshot: BattleParticipantSnapshot;
  events: BattleEvent[];
  xp: {
    attacker: number;
    defender: number;
  };
  gold?: {
    attacker: number;
    defender: number;
  };
};

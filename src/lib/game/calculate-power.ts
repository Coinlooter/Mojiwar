import type { CardDefinition, CharacterLoadout, CombatStats } from "./types";

const rarityPowerMultiplier: Record<CardDefinition["rarity"], number> = {
  common: 1,
  rare: 1.35,
  epic: 1.85,
};

export function applyCardBonuses(
  baseStats: CombatStats,
  cards: CardDefinition[],
): CombatStats {
  return cards.reduce<CombatStats>(
    (stats, card) => {
      switch (card.effectType) {
        case "bonus_hp":
          return { ...stats, hp: stats.hp + card.effectValue };
        case "bonus_attack":
          return { ...stats, attack: stats.attack + card.effectValue };
        case "bonus_defense":
          return { ...stats, defense: stats.defense + card.effectValue };
        case "bonus_speed":
          return { ...stats, speed: stats.speed + card.effectValue };
        case "bonus_crit_chance":
          return {
            ...stats,
            critChance: Math.min(0.5, stats.critChance + card.effectValue),
          };
        case "first_strike_damage":
        case "low_hp_heal":
          return stats;
      }
    },
    { ...baseStats },
  );
}

export function calculateCardPower(cards: CardDefinition[]): number {
  return Math.round(
    cards.reduce((total, card) => {
      const baseValue =
        card.effectType === "bonus_crit_chance"
          ? card.effectValue * 120
          : card.effectValue;

      return total + baseValue * rarityPowerMultiplier[card.rarity];
    }, 0),
  );
}

export function calculatePower(character: CharacterLoadout): number {
  const stats = applyCardBonuses(character.baseStats, character.deck);
  const statPower =
    stats.hp * 0.55 +
    stats.attack * 6.5 +
    stats.defense * 5.5 +
    stats.speed * 4 +
    stats.critChance * 180;

  return Math.round(statPower + character.level * 24 + calculateCardPower(character.deck));
}

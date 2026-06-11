import type {
  CardDefinition,
  CharacterLoadout,
  CombatStats,
  TalismanDefinition,
} from "./types";

const rarityPowerMultiplier: Record<CardDefinition["rarity"], number> = {
  common: 1,
  rare: 1.35,
  epic: 1.85,
};

function applyPassiveEffect(
  stats: CombatStats,
  item: CardDefinition | TalismanDefinition,
): CombatStats {
  switch (item.effectType) {
    case "bonus_hp":
      return { ...stats, hp: stats.hp + item.effectValue };
    case "bonus_attack":
      return { ...stats, attack: stats.attack + item.effectValue };
    case "bonus_defense":
      return { ...stats, defense: stats.defense + item.effectValue };
    case "bonus_speed":
      return { ...stats, speed: stats.speed + item.effectValue };
    case "bonus_crit_chance":
      return {
        ...stats,
        critChance: Math.min(0.5, stats.critChance + item.effectValue),
      };
    case "first_strike_damage":
    case "low_hp_heal":
      return stats;
  }
}

export function applyCardBonuses(
  baseStats: CombatStats,
  cards: CardDefinition[],
): CombatStats {
  return cards.reduce<CombatStats>(
    (stats, card) => applyPassiveEffect(stats, card),
    { ...baseStats },
  );
}

export function applyLoadoutBonuses(
  baseStats: CombatStats,
  deck: CardDefinition[],
  talisman: TalismanDefinition | null,
): CombatStats {
  const withDeck = applyCardBonuses(baseStats, deck);

  if (!talisman) {
    return withDeck;
  }

  return applyPassiveEffect(withDeck, talisman);
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

function calculateItemPower(
  items: Array<CardDefinition | TalismanDefinition>,
): number {
  return Math.round(
    items.reduce((total, item) => {
      const baseValue =
        item.effectType === "bonus_crit_chance"
          ? item.effectValue * 120
          : item.effectValue;

      return total + baseValue * rarityPowerMultiplier[item.rarity];
    }, 0),
  );
}

export function calculatePower(character: CharacterLoadout): number {
  const stats = applyLoadoutBonuses(
    character.baseStats,
    character.deck,
    character.talisman,
  );
  const statPower =
    stats.hp * 0.55 +
    stats.attack * 6.5 +
    stats.defense * 5.5 +
    stats.speed * 4 +
    stats.critChance * 180;
  const equippedItems = character.talisman
    ? [...character.deck, character.talisman]
    : character.deck;

  return Math.round(
    statPower + character.level * 24 + calculateItemPower(equippedItems),
  );
}

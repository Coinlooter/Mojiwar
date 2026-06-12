import { getCardAffixes } from "./card-affixes";
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
  legendary: 2.5,
};

function applyAffixToStats(stats: CombatStats, affix: ReturnType<typeof getCardAffixes>[number]) {
  switch (affix.effectType) {
    case "bonus_hp":
      return { ...stats, hp: stats.hp + affix.value };
    case "bonus_attack":
    case "battle_frenzy_attack":
      return { ...stats, attack: stats.attack + affix.value };
    case "bonus_defense":
      return { ...stats, defense: stats.defense + affix.value };
    case "bonus_speed":
      return { ...stats, speed: stats.speed + affix.value };
    case "bonus_crit_chance":
      return {
        ...stats,
        critChance: Math.min(0.5, stats.critChance + affix.value),
      };
    default:
      return stats;
  }
}

function applyTalismanEffect(stats: CombatStats, talisman: TalismanDefinition) {
  switch (talisman.effectType) {
    case "bonus_hp":
      return { ...stats, hp: stats.hp + talisman.effectValue };
    case "bonus_attack":
      return { ...stats, attack: stats.attack + talisman.effectValue };
    case "bonus_defense":
      return { ...stats, defense: stats.defense + talisman.effectValue };
    case "bonus_speed":
      return { ...stats, speed: stats.speed + talisman.effectValue };
    case "bonus_crit_chance":
      return {
        ...stats,
        critChance: Math.min(0.5, stats.critChance + talisman.effectValue),
      };
    default:
      return stats;
  }
}

export function applyCardBonuses(
  baseStats: CombatStats,
  cards: CardDefinition[],
): CombatStats {
  return cards.reduce<CombatStats>((stats, card) => {
    const affixes = getCardAffixes(card).filter((affix) =>
      [
        "bonus_hp",
        "bonus_attack",
        "bonus_defense",
        "bonus_speed",
        "bonus_crit_chance",
        "battle_frenzy_attack",
      ].includes(affix.effectType),
    );

    return affixes.reduce((currentStats, affix) => applyAffixToStats(currentStats, affix), stats);
  }, { ...baseStats });
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

  return applyTalismanEffect(withDeck, talisman);
}

function calculateAffixPower(
  affix: ReturnType<typeof getCardAffixes>[number],
  rarity: CardDefinition["rarity"],
) {
  const baseValue =
    affix.effectType === "bonus_crit_chance"
      ? affix.value * 120
      : affix.effectType === "vampiric_lifesteal" ||
          affix.effectType === "thorns_reflect" ||
          affix.effectType === "opening_barrier" ||
          affix.effectType === "double_strike_chance"
        ? affix.value * 80
        : affix.value;

  return baseValue * rarityPowerMultiplier[rarity];
}

function calculateLegacyItemPower(item: {
  rarity: CardDefinition["rarity"];
  effectType: TalismanDefinition["effectType"];
  effectValue: number;
}) {
  const baseValue =
    item.effectType === "bonus_crit_chance"
      ? item.effectValue * 120
      : item.effectValue;

  return Math.round(baseValue * rarityPowerMultiplier[item.rarity]);
}

function calculateItemPower(item: CardDefinition | TalismanDefinition): number {
  const rolledCard = item as CardDefinition;

  if (rolledCard.affixes?.length) {
    return Math.round(
      getCardAffixes(rolledCard).reduce(
        (total, affix) => total + calculateAffixPower(affix, rolledCard.rarity),
        0,
      ),
    );
  }

  if (
    "effectValue" in item &&
    item.effectType !== undefined &&
    item.effectValue !== undefined
  ) {
    return calculateLegacyItemPower({
      rarity: item.rarity,
      effectType: item.effectType,
      effectValue: item.effectValue,
    });
  }

  return Math.round(
    getCardAffixes(rolledCard).reduce(
      (total, affix) => total + calculateAffixPower(affix, rolledCard.rarity),
      0,
    ),
  );
}

export function calculateCardPower(cards: CardDefinition[]): number {
  return cards.reduce((total, card) => total + calculateItemPower(card), 0);
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
    statPower +
      character.level * 24 +
      equippedItems.reduce((total, item) => total + calculateItemPower(item), 0),
  );
}

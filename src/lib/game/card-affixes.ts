import type { CardAffix, CardDefinition, CardEffectType } from "./types";

const PASSIVE_EFFECT_TYPES = new Set<CardEffectType>([
  "bonus_hp",
  "bonus_attack",
  "bonus_defense",
  "bonus_speed",
  "bonus_crit_chance",
]);

const COMBAT_TRIGGER_EFFECT_TYPES = new Set<CardEffectType>([
  "first_strike_damage",
  "low_hp_heal",
  "vampiric_lifesteal",
  "thorns_reflect",
  "battle_frenzy_attack",
  "opening_barrier",
  "double_strike_chance",
]);

export function getCardAffixes(card: CardDefinition): CardAffix[] {
  if (card.affixes?.length) {
    return [
      ...card.affixes,
      ...(card.legendaryAffix ? [card.legendaryAffix] : []),
    ];
  }

  if (card.effectType !== undefined && card.effectValue !== undefined) {
    return [
      {
        id: card.effectType,
        label: card.name,
        effectType: card.effectType,
        value: card.effectValue,
        description: card.description,
      },
    ];
  }

  return [];
}

export function getPassiveAffixes(card: CardDefinition) {
  return getCardAffixes(card).filter((affix) =>
    PASSIVE_EFFECT_TYPES.has(affix.effectType),
  );
}

export function getCombatAffixes(card: CardDefinition) {
  return getCardAffixes(card).filter((affix) =>
    COMBAT_TRIGGER_EFFECT_TYPES.has(affix.effectType),
  );
}

export function getDeckCombatAffixes(deck: CardDefinition[]) {
  return deck.flatMap((card) => getCombatAffixes(card));
}

import {
  deriveStatRange,
  rollStatInRange,
} from "./stat-ranges";
import type { CardAffix, CardEffectType } from "./types";

export type AffixTemplate = {
  id: string;
  label: string;
  effectType: CardEffectType;
  baseValue: number;
  minValue: number;
  maxValue: number;
  statLabel: string;
};

function createAffixTemplate(
  template: Omit<AffixTemplate, "minValue" | "maxValue"> & { baseValue: number },
): AffixTemplate {
  const range = deriveStatRange(template.effectType, template.baseValue);

  return {
    ...template,
    minValue: range.minValue,
    maxValue: range.maxValue,
  };
}

export const AFFIX_POOL: AffixTemplate[] = [
  createAffixTemplate({ id: "fierce", label: "Wütend", effectType: "bonus_attack", baseValue: 4, statLabel: "Angriff" }),
  createAffixTemplate({ id: "savage", label: "Wild", effectType: "bonus_attack", baseValue: 5, statLabel: "Angriff" }),
  createAffixTemplate({ id: "keen", label: "Spitz", effectType: "bonus_attack", baseValue: 3, statLabel: "Angriff" }),
  createAffixTemplate({ id: "sturdy", label: "Stämmig", effectType: "bonus_defense", baseValue: 3, statLabel: "Verteidigung" }),
  createAffixTemplate({ id: "armored", label: "Gepanzert", effectType: "bonus_defense", baseValue: 4, statLabel: "Verteidigung" }),
  createAffixTemplate({ id: "watchful", label: "Wachsam", effectType: "bonus_defense", baseValue: 2, statLabel: "Verteidigung" }),
  createAffixTemplate({ id: "lively", label: "Lebendig", effectType: "bonus_hp", baseValue: 18, statLabel: "Leben" }),
  createAffixTemplate({ id: "unyielding", label: "Unbezwingbar", effectType: "bonus_hp", baseValue: 24, statLabel: "Leben" }),
  createAffixTemplate({ id: "renewing", label: "Regenerierend", effectType: "bonus_hp", baseValue: 14, statLabel: "Leben" }),
  createAffixTemplate({ id: "swift", label: "Flink", effectType: "bonus_speed", baseValue: 3, statLabel: "Tempo" }),
  createAffixTemplate({ id: "hasty", label: "Hastig", effectType: "bonus_speed", baseValue: 4, statLabel: "Tempo" }),
  createAffixTemplate({ id: "windy", label: "Windig", effectType: "bonus_speed", baseValue: 2, statLabel: "Tempo" }),
  createAffixTemplate({ id: "sharp", label: "Scharf", effectType: "bonus_crit_chance", baseValue: 0.06, statLabel: "Kritchance" }),
  createAffixTemplate({ id: "deadly", label: "Tödlich", effectType: "bonus_crit_chance", baseValue: 0.08, statLabel: "Kritchance" }),
  createAffixTemplate({ id: "precise", label: "Präzise", effectType: "bonus_crit_chance", baseValue: 0.05, statLabel: "Kritchance" }),
  createAffixTemplate({ id: "opening", label: "Eröffnend", effectType: "first_strike_damage", baseValue: 9, statLabel: "Startschaden" }),
  createAffixTemplate({ id: "ambush", label: "Hinterhältig", effectType: "first_strike_damage", baseValue: 12, statLabel: "Startschaden" }),
  createAffixTemplate({ id: "comfort", label: "Tröstend", effectType: "low_hp_heal", baseValue: 16, statLabel: "Notheilung" }),
  createAffixTemplate({ id: "resilient", label: "Zäh", effectType: "low_hp_heal", baseValue: 22, statLabel: "Notheilung" }),
];

export const LEGENDARY_AFFIX_POOL: AffixTemplate[] = [
  createAffixTemplate({
    id: "vampiric",
    label: "Vampirisch",
    effectType: "vampiric_lifesteal",
    baseValue: 0.25,
    statLabel: "Lebensraub",
  }),
  createAffixTemplate({
    id: "thorns",
    label: "Dornen",
    effectType: "thorns_reflect",
    baseValue: 0.3,
    statLabel: "Reflektion",
  }),
  createAffixTemplate({
    id: "frenzy",
    label: "Kampfrausch",
    effectType: "battle_frenzy_attack",
    baseValue: 8,
    statLabel: "Rausch-Angriff",
  }),
  createAffixTemplate({
    id: "barrier",
    label: "Schutzwall",
    effectType: "opening_barrier",
    baseValue: 0.4,
    statLabel: "Erste Abwehr",
  }),
  createAffixTemplate({
    id: "double",
    label: "Doppelschlag",
    effectType: "double_strike_chance",
    baseValue: 0.2,
    statLabel: "Zweiter Schlag",
  }),
];

export function buildAffixFromTemplate(
  template: AffixTemplate,
  random: () => number,
): CardAffix {
  const value = rollStatInRange(template.minValue, template.maxValue, random);

  return {
    id: template.id,
    label: template.label,
    effectType: template.effectType,
    value,
    description: formatAffixDescription(template, value),
  };
}

export function formatAffixDescription(template: AffixTemplate, value: number) {
  switch (template.effectType) {
    case "bonus_hp":
      return `+${value} Leben`;
    case "bonus_attack":
      return `+${value} Angriff`;
    case "bonus_defense":
      return `+${value} Verteidigung`;
    case "bonus_speed":
      return `+${value} Tempo`;
    case "bonus_crit_chance":
      return `+${Math.round(value * 100)}% Kritchance`;
    case "first_strike_damage":
      return `${value} Schaden in Runde 1`;
    case "low_hp_heal":
      return `+${value} Heilung unter 35% Leben`;
    case "vampiric_lifesteal":
      return `${Math.round(value * 100)}% des Schadens als Heilung`;
    case "thorns_reflect":
      return `${Math.round(value * 100)}% Schaden zurück`;
    case "battle_frenzy_attack":
      return `+${value} Angriff unter 50% Leben`;
    case "opening_barrier":
      return `${Math.round(value * 100)}% weniger Schaden beim ersten Treffer`;
    case "double_strike_chance":
      return `${Math.round(value * 100)}% Chance auf einen zweiten Schlag`;
  }
}

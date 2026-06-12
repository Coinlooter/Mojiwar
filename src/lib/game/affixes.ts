import type { CardAffix, CardEffectType } from "./types";

export type AffixTemplate = {
  id: string;
  label: string;
  effectType: CardEffectType;
  baseValue: number;
  statLabel: string;
};

export const AFFIX_POOL: AffixTemplate[] = [
  { id: "fierce", label: "Wütend", effectType: "bonus_attack", baseValue: 4, statLabel: "Angriff" },
  { id: "savage", label: "Wild", effectType: "bonus_attack", baseValue: 5, statLabel: "Angriff" },
  { id: "keen", label: "Spitz", effectType: "bonus_attack", baseValue: 3, statLabel: "Angriff" },
  { id: "sturdy", label: "Stämmig", effectType: "bonus_defense", baseValue: 3, statLabel: "Verteidigung" },
  { id: "armored", label: "Gepanzert", effectType: "bonus_defense", baseValue: 4, statLabel: "Verteidigung" },
  { id: "watchful", label: "Wachsam", effectType: "bonus_defense", baseValue: 2, statLabel: "Verteidigung" },
  { id: "lively", label: "Lebendig", effectType: "bonus_hp", baseValue: 18, statLabel: "Leben" },
  { id: "unyielding", label: "Unbezwingbar", effectType: "bonus_hp", baseValue: 24, statLabel: "Leben" },
  { id: "renewing", label: "Regenerierend", effectType: "bonus_hp", baseValue: 14, statLabel: "Leben" },
  { id: "swift", label: "Flink", effectType: "bonus_speed", baseValue: 3, statLabel: "Tempo" },
  { id: "hasty", label: "Hastig", effectType: "bonus_speed", baseValue: 4, statLabel: "Tempo" },
  { id: "windy", label: "Windig", effectType: "bonus_speed", baseValue: 2, statLabel: "Tempo" },
  { id: "sharp", label: "Scharf", effectType: "bonus_crit_chance", baseValue: 0.06, statLabel: "Kritchance" },
  { id: "deadly", label: "Tödlich", effectType: "bonus_crit_chance", baseValue: 0.08, statLabel: "Kritchance" },
  { id: "precise", label: "Präzise", effectType: "bonus_crit_chance", baseValue: 0.05, statLabel: "Kritchance" },
  { id: "opening", label: "Eröffnend", effectType: "first_strike_damage", baseValue: 9, statLabel: "Startschaden" },
  { id: "ambush", label: "Hinterhältig", effectType: "first_strike_damage", baseValue: 12, statLabel: "Startschaden" },
  { id: "comfort", label: "Tröstend", effectType: "low_hp_heal", baseValue: 16, statLabel: "Notheilung" },
  { id: "resilient", label: "Zäh", effectType: "low_hp_heal", baseValue: 22, statLabel: "Notheilung" },
];

export const LEGENDARY_AFFIX_POOL: AffixTemplate[] = [
  {
    id: "vampiric",
    label: "Vampirisch",
    effectType: "vampiric_lifesteal",
    baseValue: 0.25,
    statLabel: "Lebensraub",
  },
  {
    id: "thorns",
    label: "Dornen",
    effectType: "thorns_reflect",
    baseValue: 0.3,
    statLabel: "Reflektion",
  },
  {
    id: "frenzy",
    label: "Kampfrausch",
    effectType: "battle_frenzy_attack",
    baseValue: 8,
    statLabel: "Rausch-Angriff",
  },
  {
    id: "barrier",
    label: "Schutzwall",
    effectType: "opening_barrier",
    baseValue: 0.4,
    statLabel: "Erste Abwehr",
  },
  {
    id: "double",
    label: "Doppelschlag",
    effectType: "double_strike_chance",
    baseValue: 0.2,
    statLabel: "Zweiter Schlag",
  },
];

export function scaleAffixValue(baseValue: number, multiplier: number) {
  if (baseValue < 1) {
    return Math.round(baseValue * multiplier * 1000) / 1000;
  }

  return Math.max(1, Math.round(baseValue * multiplier));
}

export function buildAffixFromTemplate(
  template: AffixTemplate,
  multiplier: number,
): CardAffix {
  const value = scaleAffixValue(template.baseValue, multiplier);

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

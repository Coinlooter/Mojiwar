import { pickWeighted } from "./random";
import {
  deriveStatRange,
  formatPassiveStatDescription,
  rollStatInRange,
} from "./stat-ranges";
import type { CardRarity, RolledTalismanDrop, TalismanDefinition } from "./types";

export const MAX_TALISMAN_SLOTS = 1;

const talismanRarityWeights: Record<Exclude<CardRarity, "legendary">, number> = {
  common: 75,
  rare: 20,
  epic: 5,
};

export const starterTalismans: TalismanDefinition[] = [
  {
    id: "moss-amulet",
    name: "Moos-Amulett",
    emoji: "🧿",
    rarity: "common",
    effectType: "bonus_defense",
    effectValue: 2,
    description: "+2 Verteidigung (passiv).",
  },
  {
    id: "warmth-charm",
    name: "Wärme-Talisman",
    emoji: "🔮",
    rarity: "common",
    effectType: "bonus_hp",
    effectValue: 12,
    description: "+12 Leben (passiv).",
  },
  {
    id: "rage-rune",
    name: "Wut-Rune",
    emoji: "✨",
    rarity: "rare",
    effectType: "bonus_attack",
    effectValue: 5,
    description: "+5 Angriff (passiv).",
  },
  {
    id: "fortune-coin",
    name: "Glücks-Münze",
    emoji: "🪬",
    rarity: "epic",
    effectType: "bonus_crit_chance",
    effectValue: 0.05,
    description: "+5% Kritchance (passiv).",
  },
];

export function getTalismanById(talismanId: string) {
  return starterTalismans.find((talisman) => talisman.id === talismanId);
}

function pickTalismanTemplate(random: () => number): TalismanDefinition {
  const rarity = pickWeighted<Exclude<CardRarity, "legendary">>(
    [
      { item: "common", weight: talismanRarityWeights.common },
      { item: "rare", weight: talismanRarityWeights.rare },
      { item: "epic", weight: talismanRarityWeights.epic },
    ],
    random,
  );

  const candidates = starterTalismans.filter((entry) => entry.rarity === rarity);
  const index = Math.floor(random() * candidates.length);

  return candidates[index] ?? starterTalismans[0];
}

export function rollTalismanDrop(random: () => number): {
  roll: RolledTalismanDrop;
  item: TalismanDefinition;
} {
  const template = pickTalismanTemplate(random);
  const range = deriveStatRange(template.effectType, template.effectValue);
  const effectValue = rollStatInRange(range.minValue, range.maxValue, random);
  const description = formatPassiveStatDescription(template.effectType, effectValue, {
    passiveSuffix: true,
  });

  return {
    roll: {
      talismanId: template.id,
      effectValue,
      description,
    },
    item: {
      ...template,
      effectValue,
      description,
    },
  };
}

import type { TalismanDefinition } from "./types";

export const MAX_TALISMAN_SLOTS = 1;

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

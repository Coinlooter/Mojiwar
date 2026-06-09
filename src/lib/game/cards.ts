import type { CardDefinition } from "./types";

export const MAX_STARTER_DECK_SIZE = 3;

export const starterCards: CardDefinition[] = [
  {
    id: "ember-punch",
    name: "Funkenhieb",
    emoji: "🔥",
    rarity: "common",
    effectType: "bonus_attack",
    effectValue: 4,
    description: "+4 Angriff.",
  },
  {
    id: "tiny-shield",
    name: "Mini-Schild",
    emoji: "🛡️",
    rarity: "common",
    effectType: "bonus_defense",
    effectValue: 3,
    description: "+3 Verteidigung.",
  },
  {
    id: "green-heart",
    name: "Gruenes Herz",
    emoji: "💚",
    rarity: "common",
    effectType: "bonus_hp",
    effectValue: 18,
    description: "+18 Leben.",
  },
  {
    id: "swift-sneaker",
    name: "Flotter Sneaker",
    emoji: "👟",
    rarity: "common",
    effectType: "bonus_speed",
    effectValue: 3,
    description: "+3 Tempo.",
  },
  {
    id: "lucky-star",
    name: "Gluecksstern",
    emoji: "⭐",
    rarity: "rare",
    effectType: "bonus_crit_chance",
    effectValue: 0.08,
    description: "+8% Kritchance.",
  },
  {
    id: "opening-boom",
    name: "Startknall",
    emoji: "💥",
    rarity: "rare",
    effectType: "first_strike_damage",
    effectValue: 9,
    description: "Fuegt in Runde 1 Extraschaden zu.",
  },
  {
    id: "panic-snack",
    name: "Panik-Snack",
    emoji: "🍱",
    rarity: "epic",
    effectType: "low_hp_heal",
    effectValue: 16,
    description: "Heilt einmalig, wenn das Emoji unter 35% Leben faellt.",
  },
];

export function getCardById(cardId: string) {
  return starterCards.find((card) => card.id === cardId);
}

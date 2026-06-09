import { simulateBattle } from "@/lib/game/battle-engine";
import { starterCards } from "@/lib/game/cards";
import type { BattleResult } from "@/lib/game/types";

export const landingDemoBattle: BattleResult = simulateBattle({
  seed: "landing-demo",
  attacker: {
    id: "attacker",
    ownerUserId: "demo-a",
    emoji: "🦊",
    name: "Foxy",
    level: 4,
    xp: 280,
    baseStats: {
      hp: 110,
      attack: 19,
      defense: 7,
      speed: 13,
      critChance: 0.08,
    },
    deck: [starterCards[0], starterCards[3], starterCards[6]],
  },
  defender: {
    id: "defender",
    ownerUserId: "demo-b",
    emoji: "🐸",
    name: "Hopser",
    level: 3,
    xp: 190,
    baseStats: {
      hp: 126,
      attack: 16,
      defense: 9,
      speed: 9,
      critChance: 0.05,
    },
    deck: [starterCards[1], starterCards[2], starterCards[4]],
  },
});

import { describe, expect, it } from "vitest";

import {
  calculateBattleGold,
  calculateBattleXp,
  levelForXp,
  totalXpForLevel,
  xpForLevel,
} from "./leveling";
import type { CharacterLoadout } from "./types";

const loadout = (level: number, xp = 0): CharacterLoadout => ({
  id: "00000000-0000-4000-8000-000000000001",
  ownerUserId: "00000000-0000-4000-8000-000000000099",
  emoji: "🦊",
  name: "Foxy",
  level,
  xp,
  gold: 0,
  baseStats: {
    hp: 100,
    attack: 14,
    defense: 6,
    speed: 10,
    critChance: 0.05,
  },
  deck: [],
});

describe("leveling", () => {
  it("berechnet XP-Schwellen fuer Level", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(totalXpForLevel(2)).toBeGreaterThan(0);
    expect(levelForXp(0)).toBe(1);
  });

  it("vergibt mehr XP fuer einen staerkeren Gegner", () => {
    const winner = loadout(2);
    const weakerLoser = loadout(2);
    const strongerLoser = loadout(5);

    const evenMatch = calculateBattleXp({ winner, loser: weakerLoser });
    const challengeMatch = calculateBattleXp({ winner, loser: strongerLoser });

    expect(challengeMatch.winnerXp).toBeGreaterThan(evenMatch.winnerXp);
    expect(evenMatch.loserXp).toBe(10);
  });

  it("vergibt Gold nur an den Sieger und skaliert mit Gegner-Level", () => {
    const winner = loadout(2);
    const weakerLoser = loadout(2);
    const strongerLoser = loadout(5);

    const evenGold = calculateBattleGold({ winner, loser: weakerLoser });
    const challengeGold = calculateBattleGold({ winner, loser: strongerLoser });

    expect(evenGold).toBe(10);
    expect(challengeGold).toBeGreaterThan(evenGold);
  });
});

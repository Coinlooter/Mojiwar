import { describe, expect, it } from "vitest";

import {
  calculateBattleGold,
  calculateBattleXp,
  getXpProgress,
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
  talisman: null,
});

describe("leveling", () => {
  it("berechnet XP-Schwellen für Level", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(totalXpForLevel(2)).toBeGreaterThan(0);
    expect(levelForXp(0)).toBe(1);
  });

  it("berechnet den Fortschritt innerhalb des aktuellen Levels", () => {
    const needed = xpForLevel(2);

    expect(getXpProgress(0, 1)).toEqual({
      currentInLevel: 0,
      xpNeededForNextLevel: needed,
      percent: 0,
    });
    expect(getXpProgress(needed / 2, 1).percent).toBe(50);
    expect(getXpProgress(needed, 2).percent).toBe(0);
  });

  it("vergibt mehr XP für einen stärkeren Gegner", () => {
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

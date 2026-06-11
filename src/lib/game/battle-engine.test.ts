import { describe, expect, it } from "vitest";

import { simulateBattle } from "./battle-engine";
import { starterCards } from "./cards";
import type { CharacterLoadout } from "./types";

const attacker: CharacterLoadout = {
  id: "attacker",
  ownerUserId: "user-a",
  emoji: "🦊",
  name: "Foxy",
  level: 4,
  xp: 280,
  gold: 0,
  baseStats: {
    hp: 110,
    attack: 19,
    defense: 7,
    speed: 13,
    critChance: 0.08,
  },
  deck: [starterCards[0], starterCards[3], starterCards[6]],
};

const defender: CharacterLoadout = {
  id: "defender",
  ownerUserId: "user-b",
  emoji: "🐸",
  name: "Hopser",
  level: 3,
  xp: 190,
  gold: 0,
  baseStats: {
    hp: 126,
    attack: 16,
    defense: 9,
    speed: 9,
    critChance: 0.05,
  },
  deck: [starterCards[1], starterCards[2], starterCards[4]],
};

describe("simulateBattle", () => {
  it("produces deterministic results for the same seed", () => {
    const first = simulateBattle({ attacker, defender, seed: "same-seed" });
    const second = simulateBattle({ attacker, defender, seed: "same-seed" });

    expect(second).toEqual(first);
  });

  it("captures a replayable battle log", () => {
    const result = simulateBattle({ attacker, defender, seed: "replay" });

    expect(result.events[0].type).toBe("battle_started");
    expect(result.events.at(-1)?.type).toBe("battle_finished");
    expect(result.rounds).toBeGreaterThan(0);
    expect(result.xp.attacker + result.xp.defender).toBeGreaterThanOrEqual(30);
  });
});

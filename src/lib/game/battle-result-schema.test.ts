import { describe, expect, it } from "vitest";

import { simulateBattle } from "./battle-engine";
import { starterCards } from "./cards";
import { battleResultSchema, parseBattleResult } from "./schemas";
import type { CharacterLoadout } from "./types";

const attacker: CharacterLoadout = {
  id: "00000000-0000-4000-8000-000000000001",
  ownerUserId: "00000000-0000-4000-8000-000000000099",
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
};

const defender: CharacterLoadout = {
  id: "00000000-0000-4000-8000-000000000002",
  ownerUserId: "00000000-0000-4000-8000-000000000098",
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
};

describe("battleResultSchema", () => {
  it("validiert ein simuliertes Battle-Log", () => {
    const result = simulateBattle({ attacker, defender, seed: "schema-test" });
    const parsed = battleResultSchema.safeParse(result);

    expect(parsed.success).toBe(true);
  });

  it("parseBattleResult wirft bei ungueltigem Input", () => {
    expect(() => parseBattleResult({ invalid: true })).toThrow();
  });
});

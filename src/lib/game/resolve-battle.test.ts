import { describe, expect, it } from "vitest";

import { starterCards } from "./cards";
import { resolveBattleBetween } from "./resolve-battle";

const baseStats = {
  hp: 100,
  attack: 14,
  defense: 6,
  speed: 10,
  critChance: 0.05,
};

describe("resolveBattleBetween", () => {
  it("erzeugt persistierbare Kampfdaten mit XP und Belohnung", () => {
    const attacker = {
      id: "attacker-id",
      ownerUserId: "user-a",
      emoji: "🦊",
      name: "Foxy",
      level: 1,
      xp: 0,
      gold: 12,
      baseStats,
      deck: [starterCards[0], starterCards[1], starterCards[2]],
    };
    const defender = {
      id: "defender-id",
      ownerUserId: "user-b",
      emoji: "🐸",
      name: "Hopser",
      level: 1,
      xp: 0,
      gold: 4,
      baseStats,
      deck: [starterCards[3], starterCards[4], starterCards[5]],
    };

    const result = resolveBattleBetween({
      attacker,
      defender,
      seed: "test-seed",
    });

    expect(result.attackerCharacterId).toBe("attacker-id");
    expect(result.defenderCharacterId).toBe("defender-id");
    expect(result.battleLog.seed).toBe("test-seed");
    expect(result.rewardCardId).toBeTruthy();
    expect(result.attackerXpAfter).toBeGreaterThanOrEqual(0);
    expect(result.defenderXpAfter).toBeGreaterThanOrEqual(0);
    expect(result.battleLog.gold).toBeDefined();

    const winnerGoldGained =
      result.battleLog.winnerSide === "attacker"
        ? result.attackerGoldGained
        : result.defenderGoldGained;

    expect(winnerGoldGained).toBeGreaterThan(0);
    expect(result.attackerGoldGained === 0 || result.defenderGoldGained === 0).toBe(
      true,
    );
  });
});

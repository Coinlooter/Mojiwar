import { describe, expect, it } from "vitest";

import { starterCards } from "./cards";
import {
  getPowerRange,
  isOpponentInPowerRange,
  OPPONENT_POWER_MAX_TOLERANCE,
  OPPONENT_POWER_MIN_TOLERANCE,
  rankOpponentsInPowerRange,
} from "./matchmaking";
import type { CharacterLoadout } from "./types";

const player: CharacterLoadout = {
  id: "player",
  ownerUserId: "user-player",
  emoji: "🦊",
  name: "Foxy",
  level: 3,
  xp: 180,
  gold: 0,
  baseStats: {
    hp: 108,
    attack: 17,
    defense: 7,
    speed: 11,
    critChance: 0.05,
  },
  deck: [starterCards[0], starterCards[2]],
  talisman: null,
};

describe("matchmaking", () => {
  it("calculates an asymmetric power range", () => {
    expect(getPowerRange(200)).toEqual({ min: 188, max: 221 });
  });

  it("uses -6% and +10% tolerances by default", () => {
    expect(OPPONENT_POWER_MIN_TOLERANCE).toBe(0.06);
    expect(OPPONENT_POWER_MAX_TOLERANCE).toBe(0.1);
  });

  it("ranks only opponents within the power range", () => {
    const ranked = rankOpponentsInPowerRange({
      player,
      candidates: [
        {
          ...player,
          id: "too-strong",
          name: "Too Strong",
          level: 8,
          baseStats: {
            hp: 180,
            attack: 34,
            defense: 16,
            speed: 20,
            critChance: 0.12,
          },
        },
        {
          ...player,
          id: "close",
          name: "Close",
          level: 3,
          deck: [starterCards[1], starterCards[2]],
        },
      ],
    });

    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.candidate.id).toBe("close");
  });

  it("rejects opponents outside the power range", () => {
    const tooStrong = {
      ...player,
      id: "too-strong",
      name: "Too Strong",
      level: 8,
      baseStats: {
        hp: 180,
        attack: 34,
        defense: 16,
        speed: 20,
        critChance: 0.12,
      },
    };

    expect(
      isOpponentInPowerRange({
        player,
        opponent: tooStrong,
      }),
    ).toBe(false);
  });
});

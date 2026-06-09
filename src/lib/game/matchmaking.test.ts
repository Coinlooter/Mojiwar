import { describe, expect, it } from "vitest";

import { starterCards } from "./cards";
import { findBestAutomaticOpponent, getPowerRange } from "./matchmaking";
import type { CharacterLoadout } from "./types";

const player: CharacterLoadout = {
  id: "player",
  ownerUserId: "user-player",
  emoji: "🦊",
  name: "Foxy",
  level: 3,
  xp: 180,
  baseStats: {
    hp: 108,
    attack: 17,
    defense: 7,
    speed: 11,
    critChance: 0.05,
  },
  deck: [starterCards[0], starterCards[2]],
};

describe("matchmaking", () => {
  it("calculates a symmetric power range", () => {
    expect(getPowerRange(200, 0.15)).toEqual({ min: 170, max: 230 });
  });

  it("selects the closest candidate in the first matching tolerance", () => {
    const match = findBestAutomaticOpponent({
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

    expect(match?.opponent.id).toBe("close");
    expect(match?.tolerance).toBe(0.15);
  });
});

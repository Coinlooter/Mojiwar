import { describe, expect, it } from "vitest";

import { calculatePower } from "./calculate-power";
import type { CharacterLoadout } from "./types";

const baseLoadout: CharacterLoadout = {
  id: "00000000-0000-4000-8000-000000000001",
  ownerUserId: "00000000-0000-4000-8000-000000000099",
  emoji: "🦊",
  name: "Foxy",
  level: 3,
  xp: 120,
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
};

describe("calculatePower", () => {
  it("steigt mit Level und Karten im Deck", () => {
    const withoutCards = calculatePower(baseLoadout);
    const withCard = calculatePower({
      ...baseLoadout,
      deck: [
        {
          id: "ember-punch",
          name: "Funkenhieb",
          emoji: "🔥",
          rarity: "common",
          effectType: "bonus_attack",
          effectValue: 4,
          description: "Mehr Angriff",
        },
      ],
  talisman: null,
    });

    expect(withCard).toBeGreaterThan(withoutCards);
  });
});

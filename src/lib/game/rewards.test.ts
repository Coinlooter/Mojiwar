import { describe, expect, it } from "vitest";

import { createSeededRandom } from "./random";
import { rollRewardCard } from "./rewards";
import { starterCards } from "./cards";

describe("rollRewardCard", () => {
  it("ist deterministisch für denselben Seed", () => {
    const first = rollRewardCard(createSeededRandom("reward-seed"));
    const second = rollRewardCard(createSeededRandom("reward-seed"));

    expect(first.id).toBe(second.id);
  });

  it("liefert eine gültige Starter-Karte", () => {
    const reward = rollRewardCard(createSeededRandom("reward-check"));

    expect(starterCards.some((card) => card.id === reward.id)).toBe(true);
  });
});

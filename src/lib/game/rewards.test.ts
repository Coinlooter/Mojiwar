import { describe, expect, it } from "vitest";

import { createSeededRandom } from "./random";
import { rollBattleReward, rollRewardCard } from "./rewards";
import { starterCards } from "./cards";
import { starterTalismans } from "./talismans";

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

describe("rollBattleReward", () => {
  it("ist deterministisch für denselben Seed", () => {
    const first = rollBattleReward(createSeededRandom("battle-reward-seed"));
    const second = rollBattleReward(createSeededRandom("battle-reward-seed"));

    expect(first).toEqual(second);
  });

  it("liefert Karten häufiger als Talismane über viele Seeds", () => {
    let cardCount = 0;
    let talismanCount = 0;

    for (let index = 0; index < 200; index += 1) {
      const reward = rollBattleReward(createSeededRandom(`reward-mix-${index}`));

      if (reward.kind === "card") {
        cardCount += 1;
        expect(starterCards.some((card) => card.id === reward.item.id)).toBe(true);
      } else {
        talismanCount += 1;
        expect(
          starterTalismans.some((talisman) => talisman.id === reward.item.id),
        ).toBe(true);
      }
    }

    expect(cardCount).toBeGreaterThan(talismanCount);
  });
});

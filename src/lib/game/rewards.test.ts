import { describe, expect, it } from "vitest";

import { QUALITY_TIER_CONFIG } from "./card-roll";
import { createSeededRandom } from "./random";
import { rollBattleReward } from "./rewards";
import { starterTalismans } from "./talismans";

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
        expect(reward.roll.affixes.length).toBe(
          QUALITY_TIER_CONFIG[reward.roll.quality].affixCount,
        );
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

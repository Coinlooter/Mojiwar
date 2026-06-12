import { describe, expect, it } from "vitest";

import { QUALITY_TIER_CONFIG } from "./card-roll";
import { rollCardDrop } from "./card-roll";
import { createSeededRandom } from "./random";

describe("rollCardDrop", () => {
  it("ist deterministisch für denselben Seed", () => {
    const first = rollCardDrop(createSeededRandom("card-roll-seed"));
    const second = rollCardDrop(createSeededRandom("card-roll-seed"));

    expect(second).toEqual(first);
  });

  it("vergibt die richtige Affix-Anzahl je Qualitätsstufe", () => {
    const samples = Array.from({ length: 300 }, (_, index) =>
      rollCardDrop(createSeededRandom(`card-roll-tier-${index}`)),
    );

    for (const sample of samples) {
      expect(sample.affixes).toHaveLength(
        QUALITY_TIER_CONFIG[sample.quality].affixCount,
      );
    }
  });

  it("vergibt bei legendary eine einzigartige Eigenschaft", () => {
    const legendary = rollCardDrop(createSeededRandom("legendary-drop"));

    if (legendary.quality === "legendary") {
      expect(legendary.legendaryAffix).toBeDefined();
      expect(legendary.displayName).toContain(legendary.legendaryAffix?.label ?? "");
    }
  });

  it("skaliert seltene Affix-Werte höher als gewöhnliche", () => {
    const common = rollCardDrop(createSeededRandom("common-affix-scale"));
    const rare = rollCardDrop(createSeededRandom("rare-affix-scale"));

    if (common.quality === "common" && rare.quality === "rare") {
      const commonAttack = common.affixes.find(
        (affix) => affix.effectType === "bonus_attack",
      );
      const rareAttack = rare.affixes.find(
        (affix) => affix.effectType === "bonus_attack",
      );

      if (commonAttack && rareAttack && commonAttack.id === rareAttack.id) {
        expect(rareAttack.value).toBeGreaterThan(commonAttack.value);
      }
    }
  });
});

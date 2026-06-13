import { describe, expect, it } from "vitest";

import { AFFIX_POOL } from "./affixes";
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

  it("rollt Affix-Werte innerhalb der definierten Range", () => {
    const templatesById = new Map(AFFIX_POOL.map((template) => [template.id, template]));

    for (let index = 0; index < 120; index += 1) {
      const drop = rollCardDrop(createSeededRandom(`card-roll-range-${index}`));

      for (const affix of drop.affixes) {
        const template = templatesById.get(affix.id);
        expect(template).toBeDefined();
        expect(affix.value).toBeGreaterThanOrEqual(template!.minValue);
        expect(affix.value).toBeLessThanOrEqual(template!.maxValue);
      }
    }
  });
});

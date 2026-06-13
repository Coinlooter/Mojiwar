import { describe, expect, it } from "vitest";

import { createSeededRandom } from "./random";
import { deriveStatRange, rollStatInRange } from "./stat-ranges";

describe("deriveStatRange", () => {
  it("erzeugt für Angriff +4 die Range +2 bis +6", () => {
    expect(deriveStatRange("bonus_attack", 4)).toEqual({
      minValue: 2,
      maxValue: 6,
    });
  });
});

describe("rollStatInRange", () => {
  it("rollt deterministisch innerhalb der Range", () => {
    const random = createSeededRandom("stat-range-roll");
    const value = rollStatInRange(2, 6, random);

    expect(value).toBeGreaterThanOrEqual(2);
    expect(value).toBeLessThanOrEqual(6);
    expect(rollStatInRange(2, 6, createSeededRandom("stat-range-roll"))).toBe(value);
  });
});

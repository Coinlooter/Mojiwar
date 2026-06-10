import { describe, expect, it } from "vitest";

import {
  buildRecoveryCode,
  formatRecoveryCodeDisplay,
  getRecoveryCombinationCount,
  parseRecoveryCodeInput,
  validateRecoveryCodeParts,
} from "./recovery-code";

describe("recovery code", () => {
  it("builds and parses a combined code", () => {
    const parts = {
      colorSlug: "blauer",
      animalSlug: "elefant",
      numberSuffix: "65",
    };

    expect(buildRecoveryCode(parts)).toBe("blauerelefant65");
    expect(parseRecoveryCodeInput("blauerelefant65")).toEqual(parts);
    expect(parseRecoveryCodeInput(" Blauer Elefant 65 ")).toEqual(parts);
  });

  it("formats a readable display label", () => {
    const display = formatRecoveryCodeDisplay({
      colorSlug: "blauer",
      animalSlug: "elefant",
      numberSuffix: "65",
    });

    expect(display.combined).toBe("blauerelefant65");
    expect(display.colorLabel).toBe("Blau");
    expect(display.animalLabel).toBe("Elefant");
    expect(display.numberSuffix).toBe("65");
  });

  it("validates known word lists", () => {
    expect(
      validateRecoveryCodeParts({
        colorSlug: "blauer",
        animalSlug: "elefant",
        numberSuffix: "65",
      }),
    ).toBe(true);

    expect(
      validateRecoveryCodeParts({
        colorSlug: "neon",
        animalSlug: "elefant",
        numberSuffix: "65",
      }),
    ).toBe(false);
  });

  it("exposes enough combinations", () => {
    expect(getRecoveryCombinationCount()).toBeGreaterThanOrEqual(50_000);
  });
});

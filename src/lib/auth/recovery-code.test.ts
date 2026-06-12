import { describe, expect, it } from "vitest";

import {
  buildRecoveryCode,
  formatRecoveryCodeDisplay,
  getRecoveryCombinationCount,
  parseRecoveryCodeInput,
  validateRecoveryCodeParts,
} from "./recovery-code";

describe("recovery code", () => {
  it("builds and parses a combined code with masculine grammar", () => {
    const parts = {
      colorSlug: "blauer",
      animalSlug: "elefant",
      numberSuffix: "65",
    };

    expect(buildRecoveryCode(parts)).toBe("blauerelefant65");
    expect(parseRecoveryCodeInput("blauerelefant65")).toEqual(parts);
    expect(parseRecoveryCodeInput(" Blauer Elefant 65 ")).toEqual(parts);
  });

  it("uses neuter grammar for animals like Schaf", () => {
    const parts = {
      colorSlug: "goldener",
      animalSlug: "schaf",
      numberSuffix: "34",
    };

    expect(buildRecoveryCode(parts)).toBe("goldenesschaf34");
    expect(parseRecoveryCodeInput("goldenesschaf34")).toEqual(parts);
    expect(parseRecoveryCodeInput("goldenerschaf34")).toEqual(parts);
  });

  it("uses feminine grammar for animals like Katze", () => {
    const parts = {
      colorSlug: "goldener",
      animalSlug: "katze",
      numberSuffix: "12",
    };

    expect(buildRecoveryCode(parts)).toBe("goldenekatze12");
    expect(parseRecoveryCodeInput("goldenekatze12")).toEqual(parts);
    expect(parseRecoveryCodeInput("goldenerkatze12")).toEqual(parts);
  });

  it("formats a readable display label", () => {
    const display = formatRecoveryCodeDisplay({
      colorSlug: "goldener",
      animalSlug: "schaf",
      numberSuffix: "34",
    });

    expect(display.combined).toBe("goldenesschaf34");
    expect(display.colorLabel).toBe("Gold");
    expect(display.animalLabel).toBe("Schaf");
    expect(display.numberSuffix).toBe("34");
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

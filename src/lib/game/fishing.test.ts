import { describe, expect, it } from "vitest";

import {
  calculateFishingReward,
  FISH_INTERVAL_MINUTES,
  GOLD_PER_HOUR_BASE,
  MAX_FISHING_HOURS,
  summarizeFishingFish,
} from "./fishing";

describe("calculateFishingReward", () => {
  const startedAt = "2026-06-01T10:00:00.000Z";

  it("liefert keine Belohnung ohne Startzeitpunkt", () => {
    const reward = calculateFishingReward({
      fishingStartedAt: null,
      level: 3,
      now: new Date("2026-06-02T10:00:00.000Z"),
    });

    expect(reward).toEqual({
      elapsedMs: 0,
      cappedMs: 0,
      baseGold: 0,
      fish: [],
      fishGold: 0,
      totalGold: 0,
      hasReward: false,
    });
  });

  it("berechnet Basisgold und Fische deterministisch", () => {
    const now = new Date(startedAt);
    now.setHours(now.getHours() + 2);

    const reward = calculateFishingReward({
      fishingStartedAt: startedAt,
      level: 2,
      now,
    });

    expect(reward.baseGold).toBe(
      Math.floor(2 * GOLD_PER_HOUR_BASE * (1 + 2 * 0.05)),
    );
    expect(reward.fish).toHaveLength(Math.floor((2 * 60) / FISH_INTERVAL_MINUTES));
    expect(reward.totalGold).toBe(reward.baseGold + reward.fishGold);
    expect(reward.hasReward).toBe(true);

    const repeat = calculateFishingReward({
      fishingStartedAt: startedAt,
      level: 2,
      now,
    });

    expect(repeat).toEqual(reward);
  });

  it("deckelt die Offline-Zeit bei 24 Stunden", () => {
    const now = new Date(startedAt);
    now.setHours(now.getHours() + MAX_FISHING_HOURS + 6);

    const reward = calculateFishingReward({
      fishingStartedAt: startedAt,
      level: 1,
      now,
    });

    expect(reward.cappedMs).toBe(MAX_FISHING_HOURS * 60 * 60 * 1000);
    expect(reward.baseGold).toBe(
      Math.floor(MAX_FISHING_HOURS * GOLD_PER_HOUR_BASE * 1.05),
    );
    expect(reward.fish).toHaveLength((MAX_FISHING_HOURS * 60) / FISH_INTERVAL_MINUTES);
  });
});

describe("summarizeFishingFish", () => {
  it("fasst gleiche Fische zusammen", () => {
    const summary = summarizeFishingFish([
      { emoji: "🐟", gold: 2 },
      { emoji: "🐟", gold: 2 },
      { emoji: "🐡", gold: 6 },
    ]);

    expect(summary).toEqual([
      { emoji: "🐡", gold: 6, count: 1 },
      { emoji: "🐟", gold: 2, count: 2 },
    ]);
  });
});

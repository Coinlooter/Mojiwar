import { createSeededRandom, pickWeighted } from "./random";

export const MAX_FISHING_HOURS = 24;
export const GOLD_PER_HOUR_BASE = 12;
export const FISH_INTERVAL_MINUTES = 15;

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_FISH_INTERVAL = FISH_INTERVAL_MINUTES * 60 * 1000;
const MAX_FISHING_MS = MAX_FISHING_HOURS * MS_PER_HOUR;

export const FISH_TYPES = [
  { emoji: "🐟", gold: 2, weight: 50 },
  { emoji: "🐠", gold: 4, weight: 35 },
  { emoji: "🐡", gold: 6, weight: 15 },
] as const;

export type FishingFish = {
  emoji: string;
  gold: number;
};

export type FishingReward = {
  elapsedMs: number;
  cappedMs: number;
  baseGold: number;
  fish: FishingFish[];
  fishGold: number;
  totalGold: number;
  hasReward: boolean;
};

function levelGoldMultiplier(level: number) {
  return 1 + level * 0.05;
}

function rollFish(fishingStartedAt: string, index: number): FishingFish {
  const random = createSeededRandom(`${fishingStartedAt}:fish:${index}`);

  return pickWeighted(
    FISH_TYPES.map((fish) => ({
      item: { emoji: fish.emoji, gold: fish.gold },
      weight: fish.weight,
    })),
    random,
  );
}

export function calculateFishingReward(input: {
  fishingStartedAt: string | null;
  level: number;
  now?: Date;
}): FishingReward {
  const now = input.now ?? new Date();

  if (!input.fishingStartedAt) {
    return {
      elapsedMs: 0,
      cappedMs: 0,
      baseGold: 0,
      fish: [],
      fishGold: 0,
      totalGold: 0,
      hasReward: false,
    };
  }

  const startedAtMs = Date.parse(input.fishingStartedAt);

  if (Number.isNaN(startedAtMs) || startedAtMs > now.getTime()) {
    return {
      elapsedMs: 0,
      cappedMs: 0,
      baseGold: 0,
      fish: [],
      fishGold: 0,
      totalGold: 0,
      hasReward: false,
    };
  }

  const elapsedMs = now.getTime() - startedAtMs;
  const cappedMs = Math.min(elapsedMs, MAX_FISHING_MS);
  const elapsedHours = cappedMs / MS_PER_HOUR;
  const baseGold = Math.floor(
    elapsedHours * GOLD_PER_HOUR_BASE * levelGoldMultiplier(input.level),
  );
  const fishCount = Math.floor(cappedMs / MS_PER_FISH_INTERVAL);
  const fish = Array.from({ length: fishCount }, (_, index) =>
    rollFish(input.fishingStartedAt!, index),
  );
  const fishGold = fish.reduce((sum, catchFish) => sum + catchFish.gold, 0);
  const totalGold = baseGold + fishGold;

  return {
    elapsedMs,
    cappedMs,
    baseGold,
    fish,
    fishGold,
    totalGold,
    hasReward: totalGold > 0,
  };
}

export function summarizeFishingFish(fish: FishingFish[]) {
  const counts = new Map<string, { emoji: string; gold: number; count: number }>();

  for (const catchFish of fish) {
    const existing = counts.get(catchFish.emoji);

    if (existing) {
      existing.count += 1;
      continue;
    }

    counts.set(catchFish.emoji, {
      emoji: catchFish.emoji,
      gold: catchFish.gold,
      count: 1,
    });
  }

  return [...counts.values()].sort((left, right) => right.gold - left.gold);
}

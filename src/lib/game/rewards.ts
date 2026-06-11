import { pickWeighted } from "./random";
import { starterCards } from "./cards";
import { starterTalismans } from "./talismans";
import type {
  BattleReward,
  CardDefinition,
  CardRarity,
  TalismanDefinition,
} from "./types";

const rarityWeights: Record<CardRarity, number> = {
  common: 75,
  rare: 20,
  epic: 5,
};

/** Karten sind häufiger als Talismane (75 % vs. 25 %). */
const rewardKindWeights = {
  card: 75,
  talisman: 25,
} as const;

function rollByRarity<T extends { rarity: CardRarity }>(
  catalog: T[],
  random: () => number,
): T {
  const rarity = pickWeighted<CardRarity>(
    [
      { item: "common", weight: rarityWeights.common },
      { item: "rare", weight: rarityWeights.rare },
      { item: "epic", weight: rarityWeights.epic },
    ],
    random,
  );

  const candidates = catalog.filter((entry) => entry.rarity === rarity);
  const index = Math.floor(random() * candidates.length);

  return candidates[index] ?? catalog[0];
}

export function rollRewardCard(random: () => number): CardDefinition {
  return rollByRarity(starterCards, random);
}

export function rollRewardTalisman(random: () => number): TalismanDefinition {
  return rollByRarity(starterTalismans, random);
}

export function rollBattleReward(random: () => number): BattleReward {
  const kind = pickWeighted<BattleReward["kind"]>(
    [
      { item: "card", weight: rewardKindWeights.card },
      { item: "talisman", weight: rewardKindWeights.talisman },
    ],
    random,
  );

  if (kind === "talisman") {
    return { kind: "talisman", item: rollRewardTalisman(random) };
  }

  return { kind: "card", item: rollRewardCard(random) };
}

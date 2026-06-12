import { rollCardDrop } from "./card-roll";
import { pickWeighted } from "./random";
import { starterTalismans } from "./talismans";
import type {
  BattleReward,
  CardRarity,
  TalismanDefinition,
} from "./types";

const talismanRarityWeights: Record<Exclude<CardRarity, "legendary">, number> = {
  common: 75,
  rare: 20,
  epic: 5,
};

/** Karten sind häufiger als Talismane (75 % vs. 25 %). */
const rewardKindWeights = {
  card: 75,
  talisman: 25,
} as const;

function rollTalismanByRarity(random: () => number): TalismanDefinition {
  const rarity = pickWeighted<Exclude<CardRarity, "legendary">>(
    [
      { item: "common", weight: talismanRarityWeights.common },
      { item: "rare", weight: talismanRarityWeights.rare },
      { item: "epic", weight: talismanRarityWeights.epic },
    ],
    random,
  );

  const candidates = starterTalismans.filter((entry) => entry.rarity === rarity);
  const index = Math.floor(random() * candidates.length);

  return candidates[index] ?? starterTalismans[0];
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
    return { kind: "talisman", item: rollTalismanByRarity(random) };
  }

  return { kind: "card", roll: rollCardDrop(random) };
}

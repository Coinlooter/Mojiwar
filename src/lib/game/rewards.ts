import { rollCardDrop } from "./card-roll";
import { pickWeighted } from "./random";
import { rollTalismanDrop } from "./talismans";
import type { BattleReward } from "./types";

/** Karten sind häufiger als Talismane (75 % vs. 25 %). */
const rewardKindWeights = {
  card: 75,
  talisman: 25,
} as const;

export function rollBattleReward(random: () => number): BattleReward {
  const kind = pickWeighted<BattleReward["kind"]>(
    [
      { item: "card", weight: rewardKindWeights.card },
      { item: "talisman", weight: rewardKindWeights.talisman },
    ],
    random,
  );

  if (kind === "talisman") {
    const talisman = rollTalismanDrop(random);
    return {
      kind: "talisman",
      roll: talisman.roll,
      item: talisman.item,
    };
  }

  return { kind: "card", roll: rollCardDrop(random) };
}

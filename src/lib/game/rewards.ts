import { pickWeighted } from "./random";
import { starterCards } from "./cards";
import type { CardDefinition, CardRarity } from "./types";

const rarityWeights: Record<CardRarity, number> = {
  common: 75,
  rare: 20,
  epic: 5,
};

export function rollRewardCard(random: () => number): CardDefinition {
  const rarity = pickWeighted<CardRarity>(
    [
      { item: "common", weight: rarityWeights.common },
      { item: "rare", weight: rarityWeights.rare },
      { item: "epic", weight: rarityWeights.epic },
    ],
    random,
  );

  const candidates = starterCards.filter((card) => card.rarity === rarity);
  const index = Math.floor(random() * candidates.length);

  return candidates[index] ?? starterCards[0];
}

import { BattleExperience } from "@/components/battle/BattleExperience";
import { simulateBattle } from "@/lib/game/battle-engine";
import { starterCards } from "@/lib/game/cards";

const result = simulateBattle({
  seed: "demo-route",
  attacker: {
    id: "attacker",
    ownerUserId: "demo-a",
    emoji: "🦊",
    name: "Foxy",
    level: 4,
    xp: 280,
    baseStats: {
      hp: 110,
      attack: 19,
      defense: 7,
      speed: 13,
      critChance: 0.08,
    },
    deck: [starterCards[0], starterCards[3], starterCards[6]],
  },
  defender: {
    id: "defender",
    ownerUserId: "demo-b",
    emoji: "🐸",
    name: "Hopser",
    level: 3,
    xp: 190,
    baseStats: {
      hp: 126,
      attack: 16,
      defense: 9,
      speed: 9,
      critChance: 0.05,
    },
    deck: [starterCards[1], starterCards[2], starterCards[4]],
  },
});

const won = result.winnerSide === "attacker";

export default function DemoBattlePage() {
  return (
    <BattleExperience
      result={result}
      summary={{
        won,
        opponentEmoji: result.defenderSnapshot.emoji,
        opponentName: result.defenderSnapshot.name,
        rounds: result.rounds,
        xpGained: result.xp.attacker,
        goldGained: won ? 10 : 0,
        loot: won
          ? {
              emoji: starterCards[4].emoji,
              name: starterCards[4].name,
              rarity: starterCards[4].rarity,
              description: starterCards[4].description,
            }
          : undefined,
      }}
    />
  );
}

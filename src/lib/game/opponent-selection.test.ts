import { describe, expect, it } from "vitest";

import { BOT_OPPONENTS } from "@/constants/bot-opponents";
import { starterCards } from "./cards";
import {
  isOpponentChallengeable,
  rankOpponentsByProximity,
} from "./matchmaking";
import type { CharacterLoadout } from "./types";

const player: CharacterLoadout = {
  id: "player",
  ownerUserId: "user-player",
  emoji: "🦊",
  name: "Foxy",
  level: 1,
  xp: 0,
  gold: 0,
  baseStats: {
    hp: 96,
    attack: 11,
    defense: 4,
    speed: 8,
    critChance: 0.03,
  },
  deck: [],
  talisman: null,
};

function buildBotLoadout(bot: (typeof BOT_OPPONENTS)[number]): CharacterLoadout {
  return {
    id: bot.id,
    ownerUserId: "bot-pool",
    emoji: bot.emoji,
    name: bot.name,
    level: bot.level,
    xp: bot.xp,
    gold: 0,
    baseStats: bot.baseStats,
    deck: bot.deckCardIds.map((cardId, index) => ({
      ...starterCards[0],
      id: cardId,
      name: `${bot.name}-${index}`,
    })),
    talisman: null,
  };
}

describe("rankOpponentsByProximity", () => {
  it("sorts bots by closest power and limits the result", () => {
    const ranked = rankOpponentsByProximity({
      player,
      candidates: BOT_OPPONENTS.slice(0, 3).map(buildBotLoadout),
      limit: 2,
    });

    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.candidate.name).toBe("Küken");
  });
});

describe("isOpponentChallengeable", () => {
  it("allows training bots even outside the strict power range", () => {
    const champion = buildBotLoadout(BOT_OPPONENTS.at(-1)!);

    expect(
      isOpponentChallengeable({
        player,
        opponent: champion,
      }),
    ).toBe(true);
  });
});

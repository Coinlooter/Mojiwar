export const BOT_POOL_USER_ID = "a1000000-0000-4000-8000-000000000001";

export type BotOpponentDefinition = {
  id: string;
  emoji: string;
  name: string;
  level: number;
  xp: number;
  power: number;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    critChance: number;
  };
  deckCardIds: string[];
  playerCardIds: string[];
};

export const BOT_OPPONENTS: BotOpponentDefinition[] = [
  {
    id: "b1000001-0000-4000-8000-000000000001",
    emoji: "🐣",
    name: "Küken",
    level: 1,
    xp: 0,
    power: 238,
    baseStats: { hp: 96, attack: 11, defense: 4, speed: 8, critChance: 0.03 },
    deckCardIds: ["ember-punch"],
    playerCardIds: ["c1000001-0000-4000-8000-000000000001"],
  },
  {
    id: "b1000002-0000-4000-8000-000000000002",
    emoji: "🐸",
    name: "Hopser",
    level: 2,
    xp: 25,
    power: 302,
    baseStats: { hp: 102, attack: 12, defense: 5, speed: 9, critChance: 0.04 },
    deckCardIds: ["ember-punch", "tiny-shield"],
    playerCardIds: [
      "c1000002-0000-4000-8000-000000000001",
      "c1000002-0000-4000-8000-000000000002",
    ],
  },
  {
    id: "b1000003-0000-4000-8000-000000000003",
    emoji: "🦊",
    name: "Flink",
    level: 3,
    xp: 60,
    power: 382,
    baseStats: { hp: 108, attack: 14, defense: 6, speed: 10, critChance: 0.05 },
    deckCardIds: ["ember-punch", "tiny-shield", "green-heart"],
    playerCardIds: [
      "c1000003-0000-4000-8000-000000000001",
      "c1000003-0000-4000-8000-000000000002",
      "c1000003-0000-4000-8000-000000000003",
    ],
  },
  {
    id: "b1000004-0000-4000-8000-000000000004",
    emoji: "🤖",
    name: "Bolt",
    level: 4,
    xp: 110,
    power: 420,
    baseStats: { hp: 114, attack: 15, defense: 7, speed: 11, critChance: 0.05 },
    deckCardIds: ["ember-punch", "swift-sneaker", "lucky-star"],
    playerCardIds: [
      "c1000004-0000-4000-8000-000000000001",
      "c1000004-0000-4000-8000-000000000002",
      "c1000004-0000-4000-8000-000000000003",
    ],
  },
  {
    id: "b1000005-0000-4000-8000-000000000005",
    emoji: "👻",
    name: "Spuki",
    level: 5,
    xp: 170,
    power: 464,
    baseStats: { hp: 120, attack: 16, defense: 8, speed: 11, critChance: 0.06 },
    deckCardIds: ["tiny-shield", "green-heart", "lucky-star"],
    playerCardIds: [
      "c1000005-0000-4000-8000-000000000001",
      "c1000005-0000-4000-8000-000000000002",
      "c1000005-0000-4000-8000-000000000003",
    ],
  },
  {
    id: "b1000006-0000-4000-8000-000000000006",
    emoji: "🦁",
    name: "Löwi",
    level: 6,
    xp: 240,
    power: 504,
    baseStats: { hp: 128, attack: 17, defense: 9, speed: 12, critChance: 0.06 },
    deckCardIds: ["green-heart", "swift-sneaker", "lucky-star"],
    playerCardIds: [
      "c1000006-0000-4000-8000-000000000001",
      "c1000006-0000-4000-8000-000000000002",
      "c1000006-0000-4000-8000-000000000003",
    ],
  },
  {
    id: "b1000007-0000-4000-8000-000000000007",
    emoji: "🐲",
    name: "Drako",
    level: 7,
    xp: 320,
    power: 545,
    baseStats: { hp: 136, attack: 18, defense: 10, speed: 12, critChance: 0.07 },
    deckCardIds: ["ember-punch", "lucky-star", "opening-boom"],
    playerCardIds: [
      "c1000007-0000-4000-8000-000000000001",
      "c1000007-0000-4000-8000-000000000002",
      "c1000007-0000-4000-8000-000000000003",
    ],
  },
  {
    id: "b1000008-0000-4000-8000-000000000008",
    emoji: "🦄",
    name: "Luna",
    level: 8,
    xp: 410,
    power: 571,
    baseStats: { hp: 144, attack: 19, defense: 10, speed: 13, critChance: 0.08 },
    deckCardIds: ["swift-sneaker", "lucky-star", "opening-boom"],
    playerCardIds: [
      "c1000008-0000-4000-8000-000000000001",
      "c1000008-0000-4000-8000-000000000002",
      "c1000008-0000-4000-8000-000000000003",
    ],
  },
  {
    id: "b1000009-0000-4000-8000-000000000009",
    emoji: "🔥",
    name: "Inferno",
    level: 9,
    xp: 510,
    power: 636,
    baseStats: { hp: 152, attack: 21, defense: 11, speed: 14, critChance: 0.08 },
    deckCardIds: ["ember-punch", "opening-boom", "lucky-star"],
    playerCardIds: [
      "c1000009-0000-4000-8000-000000000001",
      "c1000009-0000-4000-8000-000000000002",
      "c1000009-0000-4000-8000-000000000003",
    ],
  },
  {
    id: "b100000a-0000-4000-8000-00000000000a",
    emoji: "👑",
    name: "Champion",
    level: 10,
    xp: 620,
    power: 684,
    baseStats: { hp: 160, attack: 22, defense: 12, speed: 15, critChance: 0.1 },
    deckCardIds: ["lucky-star", "opening-boom", "panic-snack"],
    playerCardIds: [
      "c100000a-0000-4000-8000-000000000001",
      "c100000a-0000-4000-8000-000000000002",
      "c100000a-0000-4000-8000-000000000003",
    ],
  },
];

export const BOT_OPPONENT_IDS = new Set(BOT_OPPONENTS.map((bot) => bot.id));

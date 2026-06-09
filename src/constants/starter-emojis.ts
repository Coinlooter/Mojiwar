export const STARTER_EMOJIS = [
  "🦊",
  "🐸",
  "👻",
  "🤖",
  "🐉",
  "🦄",
  "🐱",
  "🐶",
  "🐼",
  "🦁",
  "🐻",
  "🐨",
  "🐵",
  "🦋",
  "🐙",
  "🦉",
] as const;

export type StarterEmoji = (typeof STARTER_EMOJIS)[number];

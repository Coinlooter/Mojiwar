import type { CharacterLoadout } from "./types";

export function xpForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }

  return Math.round(100 * Math.pow(1.45, level - 2));
}

export function totalXpForLevel(level: number): number {
  let total = 0;

  for (let current = 2; current <= level; current += 1) {
    total += xpForLevel(current);
  }

  return total;
}

export function levelForXp(xp: number): number {
  let level = 1;

  while (xp >= totalXpForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

export function calculateBattleXp({
  winner,
  loser,
}: {
  winner: CharacterLoadout;
  loser: CharacterLoadout;
}) {
  const levelGap = loser.level - winner.level;
  const challengeBonus = Math.max(0, levelGap) * 3;

  return {
    winnerXp: 20 + challengeBonus,
    loserXp: 10,
  };
}

export function calculateBattleGold({
  winner,
  loser,
}: {
  winner: CharacterLoadout;
  loser: CharacterLoadout;
}) {
  const levelGap = loser.level - winner.level;
  const challengeBonus = Math.max(0, levelGap) * 2;

  return 10 + challengeBonus;
}

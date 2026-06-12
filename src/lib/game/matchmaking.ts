import { BOT_OPPONENT_IDS } from "@/constants/bot-opponents";

import { calculatePower } from "./calculate-power";
import type { CharacterLoadout } from "./types";

export const OPPONENT_POWER_MIN_TOLERANCE = 0.06;
export const OPPONENT_POWER_MAX_TOLERANCE = 0.1;
export const WIDENED_POWER_MIN_TOLERANCE = 0.15;
export const WIDENED_POWER_MAX_TOLERANCE = 0.25;
export const LOW_LEVEL_WIDENED_MAX_LEVEL = 3;

export type RankedOpponent = {
  candidate: CharacterLoadout;
  power: number;
  powerDelta: number;
};

export function getPowerRange(
  power: number,
  {
    minTolerance = OPPONENT_POWER_MIN_TOLERANCE,
    maxTolerance = OPPONENT_POWER_MAX_TOLERANCE,
  }: {
    minTolerance?: number;
    maxTolerance?: number;
  } = {},
) {
  const min = Math.floor(power * (1 - minTolerance));
  const max = Math.ceil(power * (1 + maxTolerance));

  return { min, max };
}

export function rankOpponentsInPowerRange({
  player,
  candidates,
  minTolerance = OPPONENT_POWER_MIN_TOLERANCE,
  maxTolerance = OPPONENT_POWER_MAX_TOLERANCE,
}: {
  player: CharacterLoadout;
  candidates: CharacterLoadout[];
  minTolerance?: number;
  maxTolerance?: number;
}): RankedOpponent[] {
  const playerPower = calculatePower(player);
  const range = getPowerRange(playerPower, { minTolerance, maxTolerance });

  return candidates
    .filter((candidate) => candidate.id !== player.id)
    .map((candidate) => {
      const power = calculatePower(candidate);

      return {
        candidate,
        power,
        powerDelta: Math.abs(power - playerPower),
      };
    })
    .filter(({ power }) => power >= range.min && power <= range.max)
    .sort((left, right) => {
      if (left.powerDelta !== right.powerDelta) {
        return left.powerDelta - right.powerDelta;
      }

      if (left.power !== right.power) {
        return left.power - right.power;
      }

      return left.candidate.name.localeCompare(right.candidate.name);
    });
}

export function isOpponentInPowerRange({
  player,
  opponent,
  minTolerance = OPPONENT_POWER_MIN_TOLERANCE,
  maxTolerance = OPPONENT_POWER_MAX_TOLERANCE,
}: {
  player: CharacterLoadout;
  opponent: CharacterLoadout;
  minTolerance?: number;
  maxTolerance?: number;
}) {
  const playerPower = calculatePower(player);
  const opponentPower = calculatePower(opponent);
  const range = getPowerRange(playerPower, { minTolerance, maxTolerance });

  return opponentPower >= range.min && opponentPower <= range.max;
}

export function rankOpponentsByProximity({
  player,
  candidates,
  limit = 5,
}: {
  player: CharacterLoadout;
  candidates: CharacterLoadout[];
  limit?: number;
}): RankedOpponent[] {
  const playerPower = calculatePower(player);

  return candidates
    .filter((candidate) => candidate.id !== player.id)
    .map((candidate) => {
      const power = calculatePower(candidate);

      return {
        candidate,
        power,
        powerDelta: Math.abs(power - playerPower),
      };
    })
    .sort((left, right) => {
      if (left.powerDelta !== right.powerDelta) {
        return left.powerDelta - right.powerDelta;
      }

      if (left.power !== right.power) {
        return left.power - right.power;
      }

      return left.candidate.name.localeCompare(right.candidate.name);
    })
    .slice(0, limit);
}

export function isOpponentChallengeable({
  player,
  opponent,
}: {
  player: CharacterLoadout;
  opponent: CharacterLoadout;
}) {
  if (BOT_OPPONENT_IDS.has(opponent.id)) {
    return true;
  }

  if (isOpponentInPowerRange({ player, opponent })) {
    return true;
  }

  if (player.level <= LOW_LEVEL_WIDENED_MAX_LEVEL) {
    return isOpponentInPowerRange({
      player,
      opponent,
      minTolerance: WIDENED_POWER_MIN_TOLERANCE,
      maxTolerance: WIDENED_POWER_MAX_TOLERANCE,
    });
  }

  return false;
}

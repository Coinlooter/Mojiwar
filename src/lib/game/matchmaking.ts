import { calculatePower } from "./calculate-power";
import type { CharacterLoadout } from "./types";

export const OPPONENT_POWER_TOLERANCE = 0.05;

export type RankedOpponent = {
  candidate: CharacterLoadout;
  power: number;
  powerDelta: number;
};

export function getPowerRange(power: number, tolerance = OPPONENT_POWER_TOLERANCE) {
  const min = Math.floor(power * (1 - tolerance));
  const max = Math.ceil(power * (1 + tolerance));

  return { min, max };
}

export function rankOpponentsInPowerRange({
  player,
  candidates,
  tolerance = OPPONENT_POWER_TOLERANCE,
}: {
  player: CharacterLoadout;
  candidates: CharacterLoadout[];
  tolerance?: number;
}): RankedOpponent[] {
  const playerPower = calculatePower(player);
  const range = getPowerRange(playerPower, tolerance);

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
  tolerance = OPPONENT_POWER_TOLERANCE,
}: {
  player: CharacterLoadout;
  opponent: CharacterLoadout;
  tolerance?: number;
}) {
  const playerPower = calculatePower(player);
  const opponentPower = calculatePower(opponent);
  const range = getPowerRange(playerPower, tolerance);

  return opponentPower >= range.min && opponentPower <= range.max;
}

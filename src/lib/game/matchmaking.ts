import { calculatePower } from "./calculate-power";
import type { CharacterLoadout } from "./types";

export type MatchmakingCandidate = CharacterLoadout & {
  lastBattledAt?: string | null;
};

export function getPowerRange(power: number, tolerance = 0.15) {
  const min = Math.floor(power * (1 - tolerance));
  const max = Math.ceil(power * (1 + tolerance));

  return { min, max };
}

export function findBestAutomaticOpponent({
  player,
  candidates,
  toleranceSteps = [0.15, 0.25, 0.4],
}: {
  player: CharacterLoadout;
  candidates: MatchmakingCandidate[];
  toleranceSteps?: number[];
}) {
  const playerPower = calculatePower(player);

  for (const tolerance of toleranceSteps) {
    const range = getPowerRange(playerPower, tolerance);
    const matches = candidates
      .filter((candidate) => candidate.id !== player.id)
      .map((candidate) => ({
        candidate,
        power: calculatePower(candidate),
      }))
      .filter(({ power }) => power >= range.min && power <= range.max)
      .sort((left, right) => {
        const leftDelta = Math.abs(left.power - playerPower);
        const rightDelta = Math.abs(right.power - playerPower);

        if (leftDelta !== rightDelta) {
          return leftDelta - rightDelta;
        }

        return left.candidate.name.localeCompare(right.candidate.name);
      });

    if (matches.length > 0) {
      return {
        opponent: matches[0].candidate,
        opponentPower: matches[0].power,
        playerPower,
        tolerance,
      };
    }
  }

  return null;
}

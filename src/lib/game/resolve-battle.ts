import { randomUUID } from "node:crypto";

import { BATTLE_RULES_VERSION, simulateBattle } from "./battle-engine";
import { calculatePower } from "./calculate-power";
import { levelForXp } from "./leveling";
import { createSeededRandom } from "./random";
import { rollRewardCard } from "./rewards";
import type { BattleResult, CharacterLoadout } from "./types";

export type BattlePersistenceInput = {
  attackerCharacterId: string;
  defenderCharacterId: string;
  winnerCharacterId: string;
  loserCharacterId: string;
  rulesVersion: number;
  seed: string;
  rounds: number;
  attackerPowerBefore: number;
  defenderPowerBefore: number;
  attackerXpGained: number;
  defenderXpGained: number;
  battleLog: BattleResult;
  rewardCardId: string | null;
  attackerXpAfter: number;
  attackerLevelAfter: number;
  attackerPowerAfter: number;
  defenderXpAfter: number;
  defenderLevelAfter: number;
  defenderPowerAfter: number;
};

function applyProgression(loadout: CharacterLoadout, xpGained: number) {
  const xpAfter = loadout.xp + xpGained;
  const levelAfter = levelForXp(xpAfter);
  const progressedLoadout: CharacterLoadout = {
    ...loadout,
    xp: xpAfter,
    level: levelAfter,
  };

  return {
    xpAfter,
    levelAfter,
    powerAfter: calculatePower(progressedLoadout),
  };
}

export function resolveBattleBetween({
  attacker,
  defender,
  seed = randomUUID(),
}: {
  attacker: CharacterLoadout;
  defender: CharacterLoadout;
  seed?: string;
}): BattlePersistenceInput {
  const battleLog = simulateBattle({
    attacker,
    defender,
    seed,
  });

  const winnerLoadout =
    battleLog.winnerSide === "attacker" ? attacker : defender;
  const rewardCard = rollRewardCard(createSeededRandom(`${seed}:reward`));

  const attackerProgress = applyProgression(attacker, battleLog.xp.attacker);
  const defenderProgress = applyProgression(defender, battleLog.xp.defender);

  return {
    attackerCharacterId: attacker.id,
    defenderCharacterId: defender.id,
    winnerCharacterId: winnerLoadout.id,
    loserCharacterId:
      battleLog.winnerSide === "attacker" ? defender.id : attacker.id,
    rulesVersion: BATTLE_RULES_VERSION,
    seed,
    rounds: battleLog.rounds,
    attackerPowerBefore: battleLog.attackerSnapshot.power,
    defenderPowerBefore: battleLog.defenderSnapshot.power,
    attackerXpGained: battleLog.xp.attacker,
    defenderXpGained: battleLog.xp.defender,
    battleLog,
    rewardCardId: rewardCard.id,
    attackerXpAfter: attackerProgress.xpAfter,
    attackerLevelAfter: attackerProgress.levelAfter,
    attackerPowerAfter: attackerProgress.powerAfter,
    defenderXpAfter: defenderProgress.xpAfter,
    defenderLevelAfter: defenderProgress.levelAfter,
    defenderPowerAfter: defenderProgress.powerAfter,
  };
}

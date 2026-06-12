import { randomUUID } from "node:crypto";

import { BATTLE_RULES_VERSION, simulateBattle } from "./battle-engine";
import { calculatePower } from "./calculate-power";
import { calculateBattleGold, levelForXp } from "./leveling";
import { createSeededRandom } from "./random";
import { rollBattleReward } from "./rewards";
import type { BattleResult, CharacterLoadout, RolledCardDrop } from "./types";

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
  rewardCardRoll: RolledCardDrop | null;
  rewardTalismanId: string | null;
  attackerXpAfter: number;
  attackerLevelAfter: number;
  attackerPowerAfter: number;
  attackerGoldGained: number;
  attackerGoldAfter: number;
  defenderXpAfter: number;
  defenderLevelAfter: number;
  defenderPowerAfter: number;
  defenderGoldGained: number;
  defenderGoldAfter: number;
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
  const simulatedBattle = simulateBattle({
    attacker,
    defender,
    seed,
  });

  const winnerLoadout =
    simulatedBattle.winnerSide === "attacker" ? attacker : defender;
  const loserLoadout =
    simulatedBattle.winnerSide === "attacker" ? defender : attacker;
  const battleReward = rollBattleReward(createSeededRandom(`${seed}:reward`));
  const winnerGold = calculateBattleGold({
    winner: winnerLoadout,
    loser: loserLoadout,
  });

  const attackerProgress = applyProgression(attacker, simulatedBattle.xp.attacker);
  const defenderProgress = applyProgression(defender, simulatedBattle.xp.defender);
  const attackerGoldGained =
    simulatedBattle.winnerSide === "attacker" ? winnerGold : 0;
  const defenderGoldGained =
    simulatedBattle.winnerSide === "defender" ? winnerGold : 0;
  const battleLog: BattleResult = {
    ...simulatedBattle,
    gold: {
      attacker: attackerGoldGained,
      defender: defenderGoldGained,
    },
  };

  return {
    attackerCharacterId: attacker.id,
    defenderCharacterId: defender.id,
    winnerCharacterId: winnerLoadout.id,
    loserCharacterId: loserLoadout.id,
    rulesVersion: BATTLE_RULES_VERSION,
    seed,
    rounds: simulatedBattle.rounds,
    attackerPowerBefore: simulatedBattle.attackerSnapshot.power,
    defenderPowerBefore: simulatedBattle.defenderSnapshot.power,
    attackerXpGained: simulatedBattle.xp.attacker,
    defenderXpGained: simulatedBattle.xp.defender,
    battleLog,
    rewardCardRoll: battleReward.kind === "card" ? battleReward.roll : null,
    rewardTalismanId:
      battleReward.kind === "talisman" ? battleReward.item.id : null,
    attackerXpAfter: attackerProgress.xpAfter,
    attackerLevelAfter: attackerProgress.levelAfter,
    attackerPowerAfter: attackerProgress.powerAfter,
    attackerGoldGained,
    attackerGoldAfter: attacker.gold + attackerGoldGained,
    defenderXpAfter: defenderProgress.xpAfter,
    defenderLevelAfter: defenderProgress.levelAfter,
    defenderPowerAfter: defenderProgress.powerAfter,
    defenderGoldGained,
    defenderGoldAfter: defender.gold + defenderGoldGained,
  };
}

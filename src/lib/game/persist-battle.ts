import type { BattlePersistenceInput } from "./resolve-battle";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function persistBattleResult(
  requestingUserId: string,
  input: BattlePersistenceInput,
) {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.rpc("resolve_battle", {
    p_requesting_user_id: requestingUserId,
    p_attacker_character_id: input.attackerCharacterId,
    p_defender_character_id: input.defenderCharacterId,
    p_winner_character_id: input.winnerCharacterId,
    p_loser_character_id: input.loserCharacterId,
    p_rules_version: input.rulesVersion,
    p_seed: input.seed,
    p_rounds: input.rounds,
    p_attacker_power_before: input.attackerPowerBefore,
    p_defender_power_before: input.defenderPowerBefore,
    p_attacker_xp_gained: input.attackerXpGained,
    p_defender_xp_gained: input.defenderXpGained,
    p_battle_log: input.battleLog,
    p_reward_card_roll: input.rewardCardRoll,
    p_reward_talisman_roll: input.rewardTalismanRoll,
    p_attacker_xp_after: input.attackerXpAfter,
    p_attacker_level_after: input.attackerLevelAfter,
    p_attacker_power_after: input.attackerPowerAfter,
    p_attacker_gold_gained: input.attackerGoldGained,
    p_attacker_gold_after: input.attackerGoldAfter,
    p_defender_xp_after: input.defenderXpAfter,
    p_defender_level_after: input.defenderLevelAfter,
    p_defender_power_after: input.defenderPowerAfter,
    p_defender_gold_gained: input.defenderGoldGained,
    p_defender_gold_after: input.defenderGoldAfter,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Battle could not be saved.");
  }

  return data;
}

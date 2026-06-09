import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { BattlePersistenceInput } from "./resolve-battle";

export async function persistBattleResult(
  supabase: SupabaseClient<Database>,
  input: BattlePersistenceInput,
) {
  const { data, error } = await supabase.rpc("resolve_battle", {
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
    p_battle_log: input.battleLog as unknown as Database["public"]["Tables"]["battles"]["Insert"]["battle_log"],
    p_reward_card_id: input.rewardCardId,
    p_attacker_xp_after: input.attackerXpAfter,
    p_attacker_level_after: input.attackerLevelAfter,
    p_attacker_power_after: input.attackerPowerAfter,
    p_defender_xp_after: input.defenderXpAfter,
    p_defender_level_after: input.defenderLevelAfter,
    p_defender_power_after: input.defenderPowerAfter,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Battle could not be saved.");
  }

  return data;
}

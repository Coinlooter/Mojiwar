import type { SupabaseClient } from "@supabase/supabase-js";

import type { BattleLootItem } from "@/components/battle/BattleResultScreen";
import type { Database } from "@/lib/supabase/database.types";
import { parseBattleResult } from "./schemas";
import type { BattleResult } from "./types";

type BattleRow = Database["public"]["Tables"]["battles"]["Row"];

export type BattlePageData = {
  battle: BattleRow;
  result: BattleResult;
  isAttacker: boolean;
  won: boolean;
  xpGained: number;
  goldGained: number;
  loot?: BattleLootItem;
};

export async function fetchBattleForParticipant(
  supabase: SupabaseClient<Database>,
  battleId: string,
  characterId: string,
): Promise<BattlePageData | null> {
  const { data: battle } = await supabase
    .from("battles")
    .select("*")
    .eq("id", battleId)
    .maybeSingle();

  if (!battle) {
    return null;
  }

  const isParticipant =
    battle.attacker_character_id === characterId ||
    battle.defender_character_id === characterId;

  if (!isParticipant) {
    return null;
  }

  const result = parseBattleResult(battle.battle_log);
  const isAttacker = battle.attacker_character_id === characterId;
  const won = battle.winner_character_id === characterId;
  const xpGained = isAttacker
    ? battle.attacker_xp_gained
    : battle.defender_xp_gained;
  const goldGained = won
    ? isAttacker
      ? (result.gold?.attacker ?? 0)
      : (result.gold?.defender ?? 0)
    : 0;

  let loot: BattleLootItem | undefined;

  if (won && battle.reward_player_card_id) {
    const { data: rewardRow } = await supabase
      .from("player_cards")
      .select("card_id")
      .eq("id", battle.reward_player_card_id)
      .maybeSingle();

    if (rewardRow?.card_id) {
      const { data: card } = await supabase
        .from("cards")
        .select("name, emoji, rarity, description")
        .eq("id", rewardRow.card_id)
        .maybeSingle();

      if (card) {
        loot = {
          kind: "card",
          emoji: card.emoji,
          name: card.name,
          rarity: card.rarity,
          description: card.description,
        };
      }
    }
  }

  if (won && battle.reward_player_talisman_id) {
    const { data: rewardRow } = await supabase
      .from("player_talismans")
      .select("talisman_id")
      .eq("id", battle.reward_player_talisman_id)
      .maybeSingle();

    if (rewardRow?.talisman_id) {
      const { data: talisman } = await supabase
        .from("talismans")
        .select("name, emoji, rarity, description")
        .eq("id", rewardRow.talisman_id)
        .maybeSingle();

      if (talisman) {
        loot = {
          kind: "talisman",
          emoji: talisman.emoji,
          name: talisman.name,
          rarity: talisman.rarity,
          description: talisman.description,
        };
      }
    }
  }

  return {
    battle,
    result,
    isAttacker,
    won,
    xpGained,
    goldGained,
    loot,
  };
}

export async function markBattleViewedForCharacter(
  supabase: SupabaseClient<Database>,
  battleId: string,
  characterId: string,
) {
  const { data: battle } = await supabase
    .from("battles")
    .select(
      "id, attacker_character_id, defender_character_id, viewed_by_attacker_at, viewed_by_defender_at",
    )
    .eq("id", battleId)
    .maybeSingle();

  if (!battle) {
    return;
  }

  const isAttacker = battle.attacker_character_id === characterId;
  const isDefender = battle.defender_character_id === characterId;

  if (!isAttacker && !isDefender) {
    return;
  }

  const alreadyViewed = isAttacker
    ? battle.viewed_by_attacker_at
    : battle.viewed_by_defender_at;

  if (alreadyViewed) {
    return;
  }

  const updatePayload = isAttacker
    ? { viewed_by_attacker_at: new Date().toISOString() }
    : { viewed_by_defender_at: new Date().toISOString() };

  await supabase.from("battles").update(updatePayload).eq("id", battleId);
}

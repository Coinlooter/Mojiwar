import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

import { markBattleViewed } from "@/app/battle/actions";
import { BattleExperience } from "@/components/battle/BattleExperience";
import type { BattleLootCard } from "@/components/battle/BattleResultScreen";
import { requireCharacter } from "@/lib/auth/require-character";
import type { BattleResult } from "@/lib/game/types";

export const dynamic = "force-dynamic";

export default async function BattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase, character } = await requireCharacter();
  const { id } = await params;

  const { data: battle } = await supabase
    .from("battles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!battle) {
    notFound();
  }

  const isParticipant =
    battle.attacker_character_id === character.id ||
    battle.defender_character_id === character.id;

  if (!isParticipant) {
    redirect("/dashboard" as Route);
  }

  await markBattleViewed(id);

  const result = battle.battle_log as BattleResult;
  const isAttacker = battle.attacker_character_id === character.id;
  const won = battle.winner_character_id === character.id;
  const opponentSnapshot = isAttacker
    ? result.defenderSnapshot
    : result.attackerSnapshot;
  const xpGained = isAttacker
    ? battle.attacker_xp_gained
    : battle.defender_xp_gained;

  let loot: BattleLootCard | undefined;

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
          emoji: card.emoji,
          name: card.name,
          rarity: card.rarity,
          description: card.description,
        };
      }
    }
  }

  return (
    <BattleExperience
      result={result}
      summary={{
        won,
        opponentEmoji: opponentSnapshot.emoji,
        opponentName: opponentSnapshot.name,
        rounds: battle.rounds,
        xpGained,
        loot,
      }}
    />
  );
}

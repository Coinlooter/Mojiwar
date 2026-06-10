import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

import { BattleExperience } from "@/components/battle/BattleExperience";
import { requireCharacter } from "@/lib/auth/require-character";
import { fetchBattleForParticipant } from "@/lib/game/battles";

export const dynamic = "force-dynamic";

export default async function BattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase, character } = await requireCharacter();
  const { id } = await params;
  const battleData = await fetchBattleForParticipant(supabase, id, character.id);

  if (!battleData) {
    const { data: battle } = await supabase
      .from("battles")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!battle) {
      notFound();
    }

    redirect("/dashboard" as Route);
  }

  const { result, won, xpGained, loot } = battleData;
  const opponentSnapshot = battleData.isAttacker
    ? result.defenderSnapshot
    : result.attackerSnapshot;

  return (
    <BattleExperience
      battleId={id}
      result={result}
      summary={{
        won,
        opponentEmoji: opponentSnapshot.emoji,
        opponentName: opponentSnapshot.name,
        rounds: battleData.battle.rounds,
        xpGained,
        loot,
      }}
    />
  );
}

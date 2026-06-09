import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

import { markBattleViewed } from "@/app/battle/actions";
import { BattleReplay } from "@/components/battle/BattleReplay";
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
  const won = battle.winner_character_id === character.id;

  return (
    <>
      <section style={{ marginBottom: 32 }}>
        <p className="eyebrow">{won ? "Sieg!" : "Niederlage"}</p>
        <h1>Dein Kampf ist entschieden.</h1>
        <p className="lead">
          Hier siehst du Schritt fuer Schritt, wie der Kampf abgelaufen ist.
        </p>
      </section>

      <BattleReplay result={result} />
    </>
  );
}

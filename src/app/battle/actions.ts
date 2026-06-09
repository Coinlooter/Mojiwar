"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { requireCharacter } from "@/lib/auth/require-character";
import { fetchCharacterLoadout } from "@/lib/game/loadout";
import { persistBattleResult } from "@/lib/game/persist-battle";
import { resolveBattleBetween } from "@/lib/game/resolve-battle";
import { challengeCharacterSchema } from "@/lib/game/schemas";

export async function challengeCharacter(formData: FormData) {
  const { supabase, character } = await requireCharacter();

  const parsed = challengeCharacterSchema.safeParse({
    defenderCharacterId: formData.get("defenderCharacterId"),
  });

  if (!parsed.success) {
    redirect("/opponents?error=invalid" as Route);
  }

  if (parsed.data.defenderCharacterId === character.id) {
    redirect("/opponents?error=self" as Route);
  }

  const [attacker, defender] = await Promise.all([
    fetchCharacterLoadout(supabase, character.id),
    fetchCharacterLoadout(supabase, parsed.data.defenderCharacterId),
  ]);

  if (!attacker || !defender) {
    redirect("/opponents?error=missing" as Route);
  }

  const persistenceInput = resolveBattleBetween({ attacker, defender });

  let battleId: string;

  try {
    battleId = await persistBattleResult(supabase, persistenceInput);
  } catch {
    redirect("/opponents?error=battle" as Route);
  }

  revalidatePath("/dashboard");
  revalidatePath("/deck");
  revalidatePath("/opponents");
  redirect(`/battle/${battleId}` as Route);
}

export async function markBattleViewed(battleId: string) {
  const { supabase, character } = await requireCharacter();

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

  const isAttacker = battle.attacker_character_id === character.id;
  const isDefender = battle.defender_character_id === character.id;

  if (!isAttacker && !isDefender) {
    return;
  }

  const updatePayload = isAttacker
    ? { viewed_by_attacker_at: new Date().toISOString() }
    : { viewed_by_defender_at: new Date().toISOString() };

  const alreadyViewed = isAttacker
    ? battle.viewed_by_attacker_at
    : battle.viewed_by_defender_at;

  if (alreadyViewed) {
    return;
  }

  await supabase.from("battles").update(updatePayload).eq("id", battleId);
  revalidatePath("/dashboard");
}

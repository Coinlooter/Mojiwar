"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { requireCharacter } from "@/lib/auth/require-character";
import { markBattleViewedForCharacter } from "@/lib/game/battles";
import { fetchCharacterLoadout } from "@/lib/game/loadout";
import { persistBattleResult } from "@/lib/game/persist-battle";
import { resolveBattleBetween } from "@/lib/game/resolve-battle";
import { challengeCharacterSchema } from "@/lib/game/schemas";

export async function challengeCharacter(formData: FormData) {
  const { supabase, user, character } = await requireCharacter();

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
    battleId = await persistBattleResult(user.id, persistenceInput);
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

  await markBattleViewedForCharacter(supabase, battleId, character.id);
  revalidatePath("/dashboard");
}

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

export type ChallengeError = "invalid" | "self" | "missing" | "battle";

export async function startChallenge(
  defenderCharacterId: string,
): Promise<{ ok: true; battleId: string } | { ok: false; error: ChallengeError }> {
  const parsed = challengeCharacterSchema.safeParse({ defenderCharacterId });

  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const { supabase, user, character } = await requireCharacter();

  if (parsed.data.defenderCharacterId === character.id) {
    return { ok: false, error: "self" };
  }

  const [attacker, defender] = await Promise.all([
    fetchCharacterLoadout(supabase, character.id),
    fetchCharacterLoadout(supabase, parsed.data.defenderCharacterId),
  ]);

  if (!attacker || !defender) {
    return { ok: false, error: "missing" };
  }

  const persistenceInput = resolveBattleBetween({ attacker, defender });

  try {
    const battleId = await persistBattleResult(user.id, persistenceInput);

    revalidatePath("/dashboard");
    revalidatePath("/opponents");

    return { ok: true, battleId };
  } catch {
    return { ok: false, error: "battle" };
  }
}

export async function challengeCharacter(formData: FormData) {
  const defenderCharacterId = String(formData.get("defenderCharacterId") ?? "");
  const result = await startChallenge(defenderCharacterId);

  if (!result.ok) {
    redirect(`/opponents?error=${result.error}` as Route);
  }

  redirect(`/battle/${result.battleId}` as Route);
}

export async function markBattleViewed(battleId: string) {
  const { supabase, character } = await requireCharacter();

  await markBattleViewedForCharacter(supabase, battleId, character.id);
  revalidatePath("/dashboard");
}

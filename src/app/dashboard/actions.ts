"use server";

import { revalidatePath } from "next/cache";

import { requireCharacter } from "@/lib/auth/require-character";
import { calculateFishingReward } from "@/lib/game/fishing";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type ClaimFishingError = "empty" | "claim";

export type ClaimFishingResult =
  | {
      ok: true;
      totalGold: number;
      baseGold: number;
      fishGold: number;
    }
  | { ok: false; error: ClaimFishingError };

export async function claimFishingReward(): Promise<ClaimFishingResult> {
  const { user, character } = await requireCharacter();
  const reward = calculateFishingReward({
    fishingStartedAt: character.fishing_started_at,
    level: character.level,
  });

  if (!reward.hasReward) {
    return { ok: false, error: "empty" };
  }

  const supabase = createSupabaseServiceClient();
  const claimedAt = new Date().toISOString();
  const { error } = await supabase.rpc("claim_fishing_reward", {
    p_requesting_user_id: user.id,
    p_character_id: character.id,
    p_fishing_started_at: character.fishing_started_at!,
    p_gold_gained: reward.totalGold,
    p_gold_after: character.gold + reward.totalGold,
    p_new_fishing_started_at: claimedAt,
  });

  if (error) {
    return { ok: false, error: "claim" };
  }

  revalidatePath("/dashboard");

  return {
    ok: true,
    totalGold: reward.totalGold,
    baseGold: reward.baseGold,
    fishGold: reward.fishGold,
  };
}

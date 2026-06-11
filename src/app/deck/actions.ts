"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireCharacter } from "@/lib/auth/require-character";
import { calculatePower } from "@/lib/game/calculate-power";
import { MAX_DECK_SLOTS } from "@/lib/game/cards";
import { fetchCharacterLoadout } from "@/lib/game/loadout";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/database.types";

const equipSchema = z.object({
  playerCardId: z.string().uuid(),
  slotIndex: z.coerce.number().int().min(0).max(MAX_DECK_SLOTS - 1),
});

const unequipSchema = z.object({
  slotIndex: z.coerce.number().int().min(0).max(MAX_DECK_SLOTS - 1),
});

export type DeckActionError = "invalid" | "card" | "slot" | "locked";

async function refreshCharacterPower(
  supabase: SupabaseClient<Database>,
  characterId: string,
) {
  const loadout = await fetchCharacterLoadout(supabase, characterId);

  if (!loadout) {
    return;
  }

  const serviceSupabase = createSupabaseServiceClient();

  await serviceSupabase
    .from("characters")
    .update({ power: calculatePower(loadout) })
    .eq("id", characterId);
}

function revalidateDeckPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/opponents");
}

export async function equipDeckSlotById(
  playerCardId: string,
  slotIndex: number,
): Promise<{ ok: true } | { ok: false; error: DeckActionError }> {
  const parsed = equipSchema.safeParse({ playerCardId, slotIndex });

  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const { supabase, user, character } = await requireCharacter();

  if (parsed.data.slotIndex >= character.unlocked_slot_count) {
    return { ok: false, error: "locked" };
  }

  const { data: ownedCard } = await supabase
    .from("player_cards")
    .select("id")
    .eq("id", parsed.data.playerCardId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownedCard) {
    return { ok: false, error: "card" };
  }

  await Promise.all([
    supabase
      .from("deck_slots")
      .delete()
      .eq("character_id", character.id)
      .eq("slot_index", parsed.data.slotIndex),
    supabase
      .from("deck_slots")
      .delete()
      .eq("player_card_id", parsed.data.playerCardId),
  ]);

  const { error } = await supabase.from("deck_slots").insert({
    character_id: character.id,
    player_card_id: parsed.data.playerCardId,
    slot_index: parsed.data.slotIndex,
  });

  if (error) {
    return { ok: false, error: "slot" };
  }

  await refreshCharacterPower(supabase, character.id);
  revalidateDeckPaths();

  return { ok: true };
}

export async function unequipDeckSlotByIndex(
  slotIndex: number,
): Promise<{ ok: true } | { ok: false; error: DeckActionError }> {
  const parsed = unequipSchema.safeParse({ slotIndex });

  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const { supabase, character } = await requireCharacter();

  if (parsed.data.slotIndex >= character.unlocked_slot_count) {
    return { ok: false, error: "locked" };
  }

  const { error } = await supabase
    .from("deck_slots")
    .delete()
    .eq("character_id", character.id)
    .eq("slot_index", parsed.data.slotIndex);

  if (error) {
    return { ok: false, error: "slot" };
  }

  await refreshCharacterPower(supabase, character.id);
  revalidateDeckPaths();

  return { ok: true };
}

export async function equipDeckSlot(formData: FormData) {
  const parsed = equipSchema.safeParse({
    playerCardId: formData.get("playerCardId"),
    slotIndex: formData.get("slotIndex"),
  });

  if (!parsed.success) {
    redirect("/deck?error=invalid" as Route);
  }

  const result = await equipDeckSlotById(
    parsed.data.playerCardId,
    parsed.data.slotIndex,
  );

  if (!result.ok) {
    redirect(`/deck?error=${result.error}` as Route);
  }

  redirect("/deck" as Route);
}

export async function unequipDeckSlot(formData: FormData) {
  const parsed = unequipSchema.safeParse({
    slotIndex: formData.get("slotIndex"),
  });

  if (!parsed.success) {
    redirect("/deck?error=invalid" as Route);
  }

  const result = await unequipDeckSlotByIndex(parsed.data.slotIndex);

  if (!result.ok) {
    redirect(`/deck?error=${result.error}` as Route);
  }

  redirect("/deck" as Route);
}

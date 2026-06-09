"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCharacter } from "@/lib/auth/require-character";
import { calculatePower } from "@/lib/game/calculate-power";
import { fetchCharacterLoadout } from "@/lib/game/loadout";
import { MAX_STARTER_DECK_SIZE } from "@/lib/game/cards";

const equipSchema = z.object({
  playerCardId: z.string().uuid(),
  slotIndex: z.coerce.number().int().min(0).max(MAX_STARTER_DECK_SIZE - 1),
});

const unequipSchema = z.object({
  slotIndex: z.coerce.number().int().min(0).max(MAX_STARTER_DECK_SIZE - 1),
});

async function refreshCharacterPower(characterId: string) {
  const { supabase } = await requireCharacter();
  const loadout = await fetchCharacterLoadout(supabase, characterId);

  if (!loadout) {
    return;
  }

  await supabase
    .from("characters")
    .update({ power: calculatePower(loadout) })
    .eq("id", characterId);
}

export async function equipDeckSlot(formData: FormData) {
  const { supabase, user, character } = await requireCharacter();

  const parsed = equipSchema.safeParse({
    playerCardId: formData.get("playerCardId"),
    slotIndex: formData.get("slotIndex"),
  });

  if (!parsed.success) {
    redirect("/deck?error=invalid" as Route);
  }

  const { data: ownedCard } = await supabase
    .from("player_cards")
    .select("id")
    .eq("id", parsed.data.playerCardId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownedCard) {
    redirect("/deck?error=card" as Route);
  }

  await supabase
    .from("deck_slots")
    .delete()
    .eq("character_id", character.id)
    .eq("slot_index", parsed.data.slotIndex);

  await supabase
    .from("deck_slots")
    .delete()
    .eq("player_card_id", parsed.data.playerCardId);

  const { error } = await supabase.from("deck_slots").insert({
    character_id: character.id,
    player_card_id: parsed.data.playerCardId,
    slot_index: parsed.data.slotIndex,
  });

  if (error) {
    redirect("/deck?error=slot" as Route);
  }

  await refreshCharacterPower(character.id);
  revalidatePath("/deck");
  revalidatePath("/dashboard");
  revalidatePath("/opponents");
  redirect("/deck" as Route);
}

export async function unequipDeckSlot(formData: FormData) {
  const { supabase, character } = await requireCharacter();

  const parsed = unequipSchema.safeParse({
    slotIndex: formData.get("slotIndex"),
  });

  if (!parsed.success) {
    redirect("/deck?error=invalid" as Route);
  }

  const { error } = await supabase
    .from("deck_slots")
    .delete()
    .eq("character_id", character.id)
    .eq("slot_index", parsed.data.slotIndex);

  if (error) {
    redirect("/deck?error=slot" as Route);
  }

  await refreshCharacterPower(character.id);
  revalidatePath("/deck");
  revalidatePath("/dashboard");
  revalidatePath("/opponents");
  redirect("/deck" as Route);
}

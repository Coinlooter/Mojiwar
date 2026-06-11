"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getVerifiedUser } from "@/lib/auth/session";
import { calculatePower } from "@/lib/game/calculate-power";
import { fetchCharacterLoadout } from "@/lib/game/loadout";
import { createCharacterSchema } from "@/lib/game/schemas";

export async function createCharacter(formData: FormData) {
  const { supabase, user } = await getVerifiedUser();

  if (!user) {
    redirect("/");
  }

  const parsed = createCharacterSchema.safeParse({
    emoji: formData.get("emoji"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirect("/onboarding?error=invalid" as Route);
  }

  const baseStats = {
    hp: 100,
    attack: 14,
    defense: 6,
    speed: 10,
    critChance: 0.05,
  };
  const power = calculatePower({
    id: "new-character",
    ownerUserId: user.id,
    emoji: parsed.data.emoji,
    name: parsed.data.name,
    level: 1,
    xp: 0,
    gold: 0,
    baseStats,
    deck: [],
    talisman: null,
  });

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      display_name: parsed.data.name,
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    redirect("/onboarding?error=profile" as Route);
  }

  const { data: existingCharacter } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingCharacter) {
    redirect("/dashboard");
  }

  const { data: createdCharacter, error: characterError } = await supabase
    .from("characters")
    .insert({
      user_id: user.id,
      emoji: parsed.data.emoji,
      name: parsed.data.name,
      base_hp: baseStats.hp,
      base_attack: baseStats.attack,
      base_defense: baseStats.defense,
      base_speed: baseStats.speed,
      base_crit_chance: baseStats.critChance,
      power,
    })
    .select("id")
    .single();

  if (characterError || !createdCharacter) {
    redirect("/onboarding?error=character" as Route);
  }

  const { error: starterDeckError } = await supabase.rpc("grant_starter_deck", {
    p_character_id: createdCharacter.id,
  });

  if (starterDeckError) {
    redirect("/onboarding?error=character" as Route);
  }

  const loadout = await fetchCharacterLoadout(supabase, createdCharacter.id);

  if (loadout) {
    await supabase
      .from("characters")
      .update({ power: calculatePower(loadout) })
      .eq("id", createdCharacter.id);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

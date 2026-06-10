import type { Route } from "next";
import { redirect } from "next/navigation";

import { getPrimaryCharacter } from "@/lib/auth/character";
import { getVerifiedUser } from "@/lib/auth/session";
import type { Database } from "@/lib/supabase/database.types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];

export async function requireUser() {
  const { supabase, user } = await getVerifiedUser();

  if (!user) {
    redirect("/" as Route);
  }

  return { supabase, user };
}

export async function requireCharacter(): Promise<{
  supabase: Awaited<ReturnType<typeof getVerifiedUser>>["supabase"];
  user: NonNullable<Awaited<ReturnType<typeof getVerifiedUser>>["user"]>;
  character: CharacterRow;
}> {
  const { supabase, user } = await requireUser();

  const character = await getPrimaryCharacter(supabase, user.id);

  if (!character) {
    redirect("/onboarding" as Route);
  }

  return { supabase, user, character };
}

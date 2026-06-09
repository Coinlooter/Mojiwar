import type { Route } from "next";
import { redirect } from "next/navigation";

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

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!character) {
    redirect("/onboarding" as Route);
  }

  return { supabase, user, character };
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];

export async function getPrimaryCharacter(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CharacterRow | null> {
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return character;
}

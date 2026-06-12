import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export async function fetchOpponentCharacterIds(
  supabase: SupabaseClient<Database>,
  {
    excludeCharacterId,
    minPower,
    maxPower,
  }: {
    excludeCharacterId: string;
    minPower: number;
    maxPower: number;
  },
) {
  const { data, error } = await supabase
    .from("characters")
    .select("id")
    .neq("id", excludeCharacterId)
    .gte("power", minPower)
    .lte("power", maxPower)
    .order("power", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []).map((row) => row.id);
}

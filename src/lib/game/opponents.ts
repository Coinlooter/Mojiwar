import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import {
  loadError,
  loadOk,
  type LoadResult,
} from "@/lib/ui/load-result";

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
): Promise<LoadResult<string[]>> {
  const { data, error } = await supabase
    .from("characters")
    .select("id")
    .neq("id", excludeCharacterId)
    .gte("power", minPower)
    .lte("power", maxPower)
    .order("power", { ascending: true });

  if (error) {
    return loadError();
  }

  return loadOk((data ?? []).map((row) => row.id));
}

export async function fetchBotCharacterIds(
  supabase: SupabaseClient<Database>,
): Promise<LoadResult<string[]>> {
  const { data, error } = await supabase
    .from("characters")
    .select("id")
    .eq("is_bot", true)
    .order("power", { ascending: true });

  if (error) {
    return loadError();
  }

  return loadOk((data ?? []).map((row) => row.id));
}

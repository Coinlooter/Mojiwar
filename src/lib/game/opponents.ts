import type { SupabaseClient } from "@supabase/supabase-js";

import { BOT_OPPONENT_IDS } from "@/constants/bot-opponents";
import type { Database } from "@/lib/supabase/database.types";

export function isBotOpponent(characterId: string) {
  return BOT_OPPONENT_IDS.has(characterId);
}

export async function fetchOpponentCharacterIds(
  supabase: SupabaseClient<Database>,
  currentUserId: string,
) {
  const [{ data: bots }, { data: players }] = await Promise.all([
    supabase.from("characters").select("id").eq("is_bot", true).order("power", { ascending: true }),
    supabase
      .from("characters")
      .select("id")
      .eq("is_bot", false)
      .neq("user_id", currentUserId)
      .order("power", { ascending: true }),
  ]);

  const playerIds = (players ?? []).map((row) => row.id);
  const botIds = (bots ?? []).map((row) => row.id);

  return {
    botIds,
    playerIds,
    allIds: [...playerIds, ...botIds],
    hasRealPlayers: playerIds.length > 0,
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export type LeaderboardEntry = {
  rank: number;
  characterId: string;
  emoji: string;
  name: string;
  level: number;
  power: number;
  wins: number;
  losses: number;
};

export async function fetchLeaderboard(
  supabase: SupabaseClient<Database>,
  limit = 50,
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_limit: limit,
  });

  if (error || !data) {
    return [];
  }

  return data.map((entry) => ({
    rank: Number(entry.rank),
    characterId: entry.character_id,
    emoji: entry.emoji,
    name: entry.name,
    level: entry.level,
    power: entry.power,
    wins: entry.wins,
    losses: entry.losses,
  }));
}

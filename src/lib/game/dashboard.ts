import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];
type BattleRow = Pick<
  Database["public"]["Tables"]["battles"]["Row"],
  | "id"
  | "created_at"
  | "winner_character_id"
  | "attacker_character_id"
  | "defender_character_id"
  | "viewed_by_attacker_at"
  | "viewed_by_defender_at"
>;

export type DashboardBattleRow = BattleRow & {
  opponentEmoji: string;
  opponentName: string;
  won: boolean;
  unread: boolean;
};

export type DashboardPageData = {
  character: CharacterRow;
  inboxStats: Array<{ label: string; value: number }>;
  battles: DashboardBattleRow[];
};

async function getCount<T>(
  query: PromiseLike<{ count: number | null; error: T | null }>,
) {
  const { count, error } = await query;

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function fetchDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
  character: CharacterRow,
): Promise<DashboardPageData> {
  const [receivedChallenges, ownedCards, battlesResult] = await Promise.all([
    getCount(
      supabase
        .from("battles")
        .select("id", { count: "exact", head: true })
        .eq("defender_character_id", character.id),
    ),
    getCount(
      supabase
        .from("player_cards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ),
    supabase
      .from("battles")
      .select(
        "id, created_at, winner_character_id, attacker_character_id, defender_character_id, viewed_by_attacker_at, viewed_by_defender_at",
      )
      .or(
        `attacker_character_id.eq.${character.id},defender_character_id.eq.${character.id}`,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const battles = battlesResult.data ?? [];
  const opponentIds = [
    ...new Set(
      battles.flatMap((battle) => {
        const opponentId =
          battle.attacker_character_id === character.id
            ? battle.defender_character_id
            : battle.attacker_character_id;

        return opponentId ? [opponentId] : [];
      }),
    ),
  ];

  const { data: opponents } = opponentIds.length
    ? await supabase.from("characters").select("id, emoji, name").in("id", opponentIds)
    : { data: [] };

  const opponentsById = new Map(
    (opponents ?? []).map((opponent) => [opponent.id, opponent]),
  );

  const dashboardBattles: DashboardBattleRow[] = battles.map((battle) => {
    const isAttacker = battle.attacker_character_id === character.id;
    const opponentId = isAttacker
      ? battle.defender_character_id
      : battle.attacker_character_id;
    const opponent = opponentsById.get(opponentId);
    const won = battle.winner_character_id === character.id;
    const unread = isAttacker
      ? !battle.viewed_by_attacker_at
      : !battle.viewed_by_defender_at;

    return {
      ...battle,
      opponentEmoji: opponent?.emoji ?? "❓",
      opponentName: opponent?.name ?? "Unbekannt",
      won,
      unread,
    };
  });

  return {
    character,
    inboxStats: [
      { label: "Erhalten", value: receivedChallenges },
      { label: "Siege", value: character.wins },
      { label: "Niederlagen", value: character.losses },
      { label: "Karten", value: ownedCards },
    ],
    battles: dashboardBattles,
  };
}

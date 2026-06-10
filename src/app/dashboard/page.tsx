import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { StartPlayingButton } from "@/components/auth/StartPlayingButton";
import { getVerifiedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function formatValue(value: number | null) {
  return String(value ?? 0);
}

async function getCount<T>(
  query: PromiseLike<{ count: number | null; error: T | null }>,
) {
  const { count, error } = await query;

  if (error) {
    return 0;
  }

  return count ?? 0;
}

type BattleRow = {
  id: string;
  created_at: string;
  winner_character_id: string;
  attacker_character_id: string;
  defender_character_id: string;
  viewed_by_attacker_at: string | null;
  viewed_by_defender_at: string | null;
};

export default async function DashboardPage() {
  const { supabase, user } = await getVerifiedUser();

  if (!user) {
    return (
      <section className="hero">
        <div>
          <p className="eyebrow">Noch kein Spieler</p>
          <h1>Starte zuerst deinen Emoji-Account.</h1>
          <p className="lead">
            Auf diesem Geraet wird eine sichere Supabase-Session gespeichert,
            damit du beim naechsten Besuch weiterspielen kannst.
          </p>
          <div className="actions">
            <StartPlayingButton />
          </div>
        </div>
      </section>
    );
  }

  const { data: character } = await supabase
    .from("characters")
    .select("id, emoji, name, level, xp, power, wins, losses")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!character) {
    redirect("/onboarding" as Route);
  }

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
        .eq("user_id", user.id),
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

  const battles = (battlesResult.data ?? []) as BattleRow[];
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

  const inboxStats = [
    { label: "Erhalten", value: receivedChallenges },
    { label: "Siege", value: character.wins },
    { label: "Niederlagen", value: character.losses },
    { label: "Karten", value: ownedCards },
  ];
  const isAnonymous = user.is_anonymous;

  return (
    <div className="dashboard-page">
      <header className="dashboard-top panel battle-card">
        <div className="dashboard-hero-compact">
          <span aria-hidden className="dashboard-hero-emoji">
            {character.emoji}
          </span>
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>{character.name}</h1>
            <p className="muted dashboard-hero-meta">
              Level {character.level} · {character.xp} XP · Staerke{" "}
              {character.power}
            </p>
          </div>
        </div>

        <div className="actions dashboard-actions">
          <Link className="button primary" href="/opponents">
            Kampf
          </Link>
          <Link className="button" href="/deck">
            Inventar
          </Link>
          <Link className="button" href={"/leaderboard" as Route}>
            Rangliste
          </Link>
        </div>
      </header>

      <section aria-label="Spielstatistiken" className="dashboard-stats">
        {inboxStats.map((stat) => (
          <article className="dashboard-stat" key={stat.label}>
            <div className="dashboard-stat-value">{formatValue(stat.value)}</div>
            <p className="muted">{stat.label}</p>
          </article>
        ))}
      </section>

      <div className="dashboard-main">
        <section className="panel battle-card dashboard-battles">
          <div className="dashboard-section-head">
            <p className="eyebrow">Letzte Kaempfe</p>
          </div>

          {battles.length === 0 ? (
            <p className="muted dashboard-empty">
              Noch keine Kaempfe. Starte unter Kampf deinen ersten Kampf.
            </p>
          ) : (
            <div className="dashboard-battle-list">
              {battles.map((battle) => {
                const isAttacker = battle.attacker_character_id === character.id;
                const opponentId = isAttacker
                  ? battle.defender_character_id
                  : battle.attacker_character_id;
                const opponent = opponentsById.get(opponentId);
                const won = battle.winner_character_id === character.id;
                const unread = isAttacker
                  ? !battle.viewed_by_attacker_at
                  : !battle.viewed_by_defender_at;

                return (
                  <article
                    className={`dashboard-battle-row${unread ? " dashboard-battle-row-new" : ""}`}
                    key={battle.id}
                  >
                    <span
                      aria-hidden
                      className={`dashboard-battle-result${won ? " is-win" : " is-loss"}`}
                    >
                      {won ? "S" : "N"}
                    </span>
                    <div className="dashboard-battle-copy">
                      <strong>
                        {opponent?.emoji} {opponent?.name ?? "Unbekannt"}
                      </strong>
                      <span className="muted">
                        {new Date(battle.created_at).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {unread ? " · Neu" : ""}
                      </span>
                    </div>
                    <Link
                      className="button dashboard-battle-link"
                      href={`/battle/${battle.id}` as Route}
                    >
                      Replay
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="dashboard-side">
          <article className="panel battle-card dashboard-account">
            <p className="eyebrow">Account</p>
            <p className="muted dashboard-account-copy">
              {isAnonymous
                ? "Anonymer Account — sichere ihn spaeter mit einer Eltern-E-Mail."
                : "Account ist mit einer Login-Methode gesichert."}
            </p>
            <SignOutButton />
          </article>
        </aside>
      </div>
    </div>
  );
}

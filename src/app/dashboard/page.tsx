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
    .select("id, emoji, name, level, xp, power")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!character) {
    redirect("/onboarding" as Route);
  }

  const [
    receivedChallenges,
    wins,
    losses,
    ownedCards,
    battlesResult,
    opponentsResult,
  ] = await Promise.all([
      getCount(
        supabase
          .from("battles")
          .select("id", { count: "exact", head: true })
          .eq("defender_character_id", character.id),
      ),
      getCount(
        supabase
          .from("battles")
          .select("id", { count: "exact", head: true })
          .eq("winner_character_id", character.id),
      ),
      getCount(
        supabase
          .from("battles")
          .select("id", { count: "exact", head: true })
          .eq("loser_character_id", character.id),
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
      supabase.from("characters").select("id, emoji, name"),
    ]);

  const inboxStats = [
    { label: "Herausforderungen erhalten", value: receivedChallenges },
    { label: "Gewonnen", value: wins },
    { label: "Verloren", value: losses },
    { label: "Karten im Besitz", value: ownedCards },
  ];
  const isAnonymous = user.is_anonymous;
  const battles = (battlesResult.data ?? []) as BattleRow[];
  const opponentsById = new Map(
    (opponentsResult.data ?? []).map((opponent) => [opponent.id, opponent]),
  );

  return (
    <>
      <section>
        <p className="eyebrow">Mein Spiel</p>
        <h1>Willkommen zurueck, {character.name}.</h1>
        <p className="lead">
          Hier siehst du deine letzten Kaempfe, deine Karten und was passiert ist,
          waehrend du weg warst.
        </p>
        <div className="actions">
          <Link className="button primary" href="/opponents">
            Gegner suchen
          </Link>
          <Link className="button" href="/deck">
            Karten verwalten
          </Link>
        </div>
      </section>

      <section className="stat-grid" aria-label="Spielstatistiken">
        {inboxStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className="stat-value">{formatValue(stat.value)}</div>
            <p className="muted">{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="section">
        <p className="eyebrow">Letzte Kaempfe</p>
        {battles.length === 0 ? (
          <article className="feature-card">
            <p className="muted">
              Noch keine Kaempfe. Starte auf der Gegner-Seite deinen ersten Kampf.
            </p>
          </article>
        ) : (
          <div className="inbox-list">
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
                <article className="inbox-card" key={battle.id}>
                  <div>
                    <h3>
                      {won ? "Sieg" : "Niederlage"} gegen {opponent?.emoji}{" "}
                      {opponent?.name ?? "Unbekannt"}
                    </h3>
                    <p className="muted">
                      {new Date(battle.created_at).toLocaleString("de-DE")}
                      {unread ? " · Neu" : ""}
                    </p>
                  </div>
                  <Link
                    className="button"
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

      <section className="section feature-grid">
        <article className="feature-card">
          <h3>Aktives Emoji</h3>
          <div className="emoji">{character.emoji}</div>
          <p className="muted">
            {character.name} · Level {character.level} · {character.xp} XP ·
            Staerke {character.power}
          </p>
        </article>
        <article className="feature-card">
          <h3>Account sichern</h3>
          <p className="muted">
            {isAnonymous
              ? "Dieser Account ist anonym. Spaeter kannst du ihn mit einer Eltern-E-Mail sichern."
              : "Dieser Account ist mit einer Login-Methode gesichert."}
          </p>
        </article>
        <article className="feature-card">
          <h3>Session verwalten</h3>
          <p className="muted">
            Nicht abmelden, wenn du anonym spielst und den Fortschritt noch
            nicht gesichert hast.
          </p>
          <SignOutButton />
        </article>
      </section>
    </>
  );
}

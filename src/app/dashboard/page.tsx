import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

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

export default async function DashboardPage() {
  const { supabase, user } = await getVerifiedUser();

  if (!user) {
    return (
      <main className="page-shell">
        <nav className="nav" aria-label="Hauptnavigation">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden>
              🏟️
            </span>
            <span>Mojiwar Dashboard</span>
          </Link>
        </nav>

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
      </main>
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

  const [receivedChallenges, wins, losses, ownedCards] = await Promise.all([
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
  ]);

  const inboxStats = [
    { label: "Herausforderungen erhalten", value: receivedChallenges },
    { label: "Gewonnen", value: wins },
    { label: "Verloren", value: losses },
    { label: "Karten im Besitz", value: ownedCards },
  ];
  const isAnonymous = user.is_anonymous;

  return (
    <main className="page-shell">
      <nav className="nav" aria-label="Hauptnavigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            🏟️
          </span>
          <span>Mojiwar Dashboard</span>
        </Link>
        <div className="nav-links">
          <Link href="/opponents">Gegner suchen</Link>
          <Link href="/deck">Deck bearbeiten</Link>
        </div>
      </nav>

      <section>
        <p className="eyebrow">Offline-Inbox</p>
        <h1>Willkommen zurueck, {character.name}.</h1>
        <p className="lead">
          Deine Session ist auf diesem Geraet gespeichert. Solange die
          Browserdaten erhalten bleiben, kannst du ohne erneutes Login
          weiterspielen.
        </p>
      </section>

      <section className="stat-grid" aria-label="Offline Statistiken">
        {inboxStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className="stat-value">{formatValue(stat.value)}</div>
            <p className="muted">{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="section feature-grid">
        <article className="feature-card">
          <h3>Aktives Emoji</h3>
          <div className="emoji">{character.emoji}</div>
          <p className="muted">
            {character.name} · Level {character.level} · {character.xp} XP ·
            Power {character.power}
          </p>
        </article>
        <article className="feature-card">
          <h3>Account sichern</h3>
          <p className="muted">
            {isAnonymous
              ? "Dieser Account ist anonym. Als naechster Schritt kommt Eltern-E-Mail oder Magic Link, damit der Fortschritt auch auf neuen Geraeten wiederherstellbar ist."
              : "Dieser Account ist mit einer Login-Methode gesichert."}
          </p>
        </article>
        <article className="feature-card">
          <h3>Session verwalten</h3>
          <p className="muted">
            Nicht abmelden, wenn du anonym spielst und den Fortschritt noch
            nicht gesichert hast.
          </p>
          <form action="/auth/signout" method="post">
            <button className="button" type="submit">
              Abmelden
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}

import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { StartPlayingButton } from "@/components/auth/StartPlayingButton";
import { getPrimaryCharacter } from "@/lib/auth/character";
import { getVerifiedUser } from "@/lib/auth/session";
import { fetchDashboardData } from "@/lib/game/dashboard";

export const dynamic = "force-dynamic";

function formatValue(value: number | null) {
  return String(value ?? 0);
}

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

  const character = await getPrimaryCharacter(supabase, user.id);

  if (!character) {
    redirect("/onboarding" as Route);
  }

  const { inboxStats, battles } = await fetchDashboardData(
    supabase,
    user.id,
    character,
  );
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
              {battles.map((battle) => (
                <article
                  className={`dashboard-battle-row${battle.unread ? " dashboard-battle-row-new" : ""}`}
                  key={battle.id}
                >
                  <span
                    aria-label={battle.won ? "Sieg" : "Niederlage"}
                    className={`dashboard-battle-result${battle.won ? " is-win" : " is-loss"}`}
                  >
                    <span aria-hidden>{battle.won ? "S" : "N"}</span>
                  </span>
                  <div className="dashboard-battle-copy">
                    <strong>
                      {battle.opponentEmoji} {battle.opponentName}
                    </strong>
                    <span className="muted">
                      {new Date(battle.created_at).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {battle.unread ? " · Neu" : ""}
                    </span>
                  </div>
                  <Link
                    className="button dashboard-battle-link"
                    href={`/battle/${battle.id}` as Route}
                  >
                    Replay
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="dashboard-side">
          <article className="panel battle-card dashboard-account">
            <p className="eyebrow">Account</p>
            <p className="muted dashboard-account-copy">
              {isAnonymous
                ? "Anonymer Account — sichere deinen Fortschritt mit Speicher-Code oder Eltern-E-Mail."
                : `Account gesichert${user.email ? ` als ${user.email}` : ""}.`}
            </p>
            <div className="actions dashboard-account-actions">
              {isAnonymous ? (
                <Link className="button primary" href={"/account/secure" as Route}>
                  Fortschritt sichern
                </Link>
              ) : null}
              <Link className="button" href={"/account/load" as Route}>
                Auf Geraet laden
              </Link>
            </div>
            <SignOutButton />
          </article>
        </aside>
      </div>
    </div>
  );
}

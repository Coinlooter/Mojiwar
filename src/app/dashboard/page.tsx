import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { AccountPanel } from "@/components/account/AccountPanel";
import { StartPlayingButton } from "@/components/auth/StartPlayingButton";
import { getPrimaryCharacter } from "@/lib/auth/character";
import { getVerifiedUser } from "@/lib/auth/session";
import { fetchDashboardData } from "@/lib/game/dashboard";

export const dynamic = "force-dynamic";

function formatValue(value: number | null) {
  return String(value ?? 0);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ login?: string; "login-error"?: string }>;
}) {
  const { supabase, user } = await getVerifiedUser();
  const params = await searchParams;

  if (!user) {
    return (
      <section className="hero">
        <div>
          <p className="eyebrow">Willkommen</p>
          <h1>Hier startet dein Abenteuer.</h1>
          <p className="lead">
            Erstelle dein Emoji und kaempfe gegen andere. Dein Fortschritt bleibt
            auf diesem Geraet gespeichert.
          </p>
          <div className="actions">
            <StartPlayingButton>Jetzt spielen</StartPlayingButton>
            <Link className="button" href={"/login" as Route}>
              Schon einen Code?
            </Link>
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
  const isAnonymous = user.is_anonymous ?? false;

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
              Level {character.level} · {character.xp} XP · {character.gold} 🪙
              Gold · Staerke {character.power}
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
          <article
            className={`dashboard-stat${stat.label === "Gold" ? " dashboard-stat-gold" : ""}`}
            key={stat.label}
          >
            <div className="dashboard-stat-value">
              {stat.label === "Gold" ? `${formatValue(stat.value)} 🪙` : formatValue(stat.value)}
            </div>
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
          <AccountPanel
            email={user.email}
            isAnonymous={isAnonymous}
            loginError={params["login-error"]}
            loginStatus={params.login}
            userId={user.id}
          />
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";

import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { requireUser } from "@/lib/auth/require-character";
import { fetchLeaderboard } from "@/lib/game/leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const { supabase, user } = await requireUser();

  const [{ data: character }, entries] = await Promise.all([
    supabase
      .from("characters")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    fetchLeaderboard(supabase),
  ]);

  const currentEntry = character
    ? entries.find((entry) => entry.characterId === character.id)
    : undefined;

  return (
    <>
      <section>
        <p className="eyebrow">Rangliste</p>
        <h1>Die staerksten Emoji-Helden im Land.</h1>
        <p className="lead">
          Hier siehst du, wer die meisten Kaempfe gewonnen hat. Uebungsgegner
          sind nicht dabei — nur echte Spieler.
        </p>
      </section>

      {currentEntry ? (
        <section className="section panel battle-card leaderboard-summary">
          <p className="eyebrow">Dein Platz</p>
          <div className="leaderboard-summary-row">
            <span className="leaderboard-summary-rank">#{currentEntry.rank}</span>
            <span className="leaderboard-summary-emoji" aria-hidden>
              {currentEntry.emoji}
            </span>
            <div>
              <h2>{currentEntry.name}</h2>
              <p className="muted">
                {currentEntry.wins} Siege · {currentEntry.losses} Niederlagen ·
                Level {currentEntry.level} · Staerke {currentEntry.power}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="section panel battle-card">
          <p className="muted">
            Du hast noch keinen Helden.{" "}
            <Link href="/onboarding">Erstelle dein Emoji</Link>, um in der
            Rangliste zu erscheinen.
          </p>
        </section>
      )}

      <section className="section">
        <p className="eyebrow">Top-Spieler</p>
        <LeaderboardTable
          currentCharacterId={character?.id}
          entries={entries}
        />
      </section>
    </>
  );
}

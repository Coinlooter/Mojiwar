import Link from "next/link";

import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPrimaryCharacter } from "@/lib/auth/character";
import { requireUser } from "@/lib/auth/require-character";
import { fetchLeaderboard } from "@/lib/game/leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const { supabase, user } = await requireUser();

  const [{ character }, entries] = await Promise.all([
    getPrimaryCharacter(supabase, user.id).then((row) => ({ character: row })),
    fetchLeaderboard(supabase),
  ]);

  const currentEntry = character
    ? entries.find((entry) => entry.characterId === character.id)
    : undefined;

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-top panel battle-card">
        <PageHeader
          eyebrow="Rangliste"
          lead="Hier siehst du, wer die meisten Kaempfe gewonnen hat. Uebungsgegner sind nicht dabei — nur echte Spieler."
          title="Die staerksten Emoji-Helden im Land."
        />
      </header>

      {currentEntry ? (
        <section className="leaderboard-summary panel battle-card">
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
        <section className="panel battle-card">
          <p className="muted">
            Du hast noch keinen Helden.{" "}
            <Link href="/onboarding">Erstelle dein Emoji</Link>, um in der
            Rangliste zu erscheinen.
          </p>
        </section>
      )}

      <section className="leaderboard-table-section panel battle-card">
        <p className="eyebrow">Top-Spieler</p>
        <LeaderboardTable
          currentCharacterId={character?.id}
          entries={entries}
        />
      </section>
    </div>
  );
}

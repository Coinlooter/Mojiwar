import type { LeaderboardEntry } from "@/lib/game/leaderboard";

function rankLabel(rank: number) {
  if (rank === 1) {
    return "🥇";
  }

  if (rank === 2) {
    return "🥈";
  }

  if (rank === 3) {
    return "🥉";
  }

  return String(rank);
}

export function LeaderboardTable({
  entries,
  currentCharacterId,
}: {
  entries: LeaderboardEntry[];
  currentCharacterId?: string;
}) {
  if (entries.length === 0) {
    return (
      <article className="feature-card">
        <p className="muted">
          Noch keine Spieler in der Rangliste. Sei der Erste, der einen Kampf
          gewinnt!
        </p>
      </article>
    );
  }

  return (
    <div className="leaderboard-table" role="table" aria-label="Rangliste">
      <div className="leaderboard-header" role="row">
        <span role="columnheader">Platz</span>
        <span role="columnheader">Held</span>
        <span role="columnheader">Siege</span>
        <span role="columnheader">Niederlagen</span>
        <span role="columnheader">Level</span>
        <span role="columnheader">Stärke</span>
      </div>

      {entries.map((entry) => {
        const isCurrent = entry.characterId === currentCharacterId;

        return (
          <article
            className={`leaderboard-row${isCurrent ? " leaderboard-row-current" : ""}${entry.rank <= 3 ? ` leaderboard-row-top-${entry.rank}` : ""}`}
            key={entry.characterId}
            role="row"
          >
            <span className="leaderboard-rank" role="cell">
              <span aria-hidden>{rankLabel(entry.rank)}</span>
              <span className="sr-only">Platz {entry.rank}</span>
            </span>
            <span className="leaderboard-player" role="cell">
              <span aria-hidden className="leaderboard-emoji">
                {entry.emoji}
              </span>
              <span>
                <strong>{entry.name}</strong>
                {isCurrent ? (
                  <span className="leaderboard-you-badge">Du</span>
                ) : null}
              </span>
            </span>
            <span className="leaderboard-stat leaderboard-stat-win" role="cell">
              {entry.wins}
            </span>
            <span className="leaderboard-stat" role="cell">
              {entry.losses}
            </span>
            <span className="leaderboard-stat" role="cell">
              {entry.level}
            </span>
            <span className="leaderboard-stat" role="cell">
              {entry.power}
            </span>
          </article>
        );
      })}
    </div>
  );
}

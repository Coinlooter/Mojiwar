import { ChallengeOpponentButton } from "@/components/opponents/ChallengeOpponentButton";
import type { CharacterLoadout } from "@/lib/game/types";

export function OpponentRow({
  candidate,
  playerEmoji,
  power,
  rank,
  onError,
}: {
  candidate: CharacterLoadout;
  playerEmoji: string;
  power: number;
  rank: number;
  onError?: (message: string) => void;
}) {
  return (
    <article className="fight-opponent-row">
      <span aria-hidden className="fight-opponent-rank">
        {rank}
      </span>
      <span aria-hidden className="fight-opponent-emoji">
        {candidate.emoji}
      </span>
      <div className="fight-opponent-copy">
        <strong>{candidate.name}</strong>
        <span className="muted">
          Lv {candidate.level} · Stärke {power} · {candidate.deck.length} Karten
        </span>
      </div>
      <ChallengeOpponentButton
        className="button primary"
        defenderCharacterId={candidate.id}
        onError={onError}
        opponentEmoji={candidate.emoji}
        opponentName={candidate.name}
        playerEmoji={playerEmoji}
      >
        Kampf
      </ChallengeOpponentButton>
    </article>
  );
}

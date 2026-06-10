import { ChallengeOpponentButton } from "@/components/opponents/ChallengeOpponentButton";
import { BOT_OPPONENT_IDS } from "@/constants/bot-opponents";
import { calculatePower } from "@/lib/game/calculate-power";
import type { CharacterLoadout } from "@/lib/game/types";

export function OpponentRow({
  candidate,
  playerEmoji,
  onError,
}: {
  candidate: CharacterLoadout;
  playerEmoji: string;
  onError?: (message: string) => void;
}) {
  const isBot = BOT_OPPONENT_IDS.has(candidate.id);
  const power = calculatePower(candidate);

  return (
    <article className="fight-opponent-row">
      <span aria-hidden className="fight-opponent-emoji">
        {candidate.emoji}
      </span>
      <div className="fight-opponent-copy">
        <strong>
          {candidate.name}
          {isBot ? <span className="fight-opponent-tag">Übung</span> : null}
        </strong>
        <span className="muted">
          Lv {candidate.level} · {power} · {candidate.deck.length} Karten
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

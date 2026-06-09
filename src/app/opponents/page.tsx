import { challengeCharacter } from "@/app/battle/actions";
import { requireCharacter } from "@/lib/auth/require-character";
import { BOT_OPPONENT_IDS } from "@/constants/bot-opponents";
import { calculatePower } from "@/lib/game/calculate-power";
import { fetchCharacterLoadout, fetchCharacterLoadouts } from "@/lib/game/loadout";
import { findBestAutomaticOpponent } from "@/lib/game/matchmaking";
import { fetchOpponentCharacterIds } from "@/lib/game/opponents";
import type { CharacterLoadout } from "@/lib/game/types";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "Dieser Gegner konnte nicht herausgefordert werden.",
  self: "Du kannst dich nicht selbst herausfordern.",
  missing: "Der Gegner wurde nicht gefunden.",
  battle: "Der Kampf konnte gerade nicht gestartet werden. Versuche es erneut.",
};

function OpponentCard({ candidate }: { candidate: CharacterLoadout }) {
  const isBot = BOT_OPPONENT_IDS.has(candidate.id);

  return (
    <article className="feature-card">
      <div className="emoji">{candidate.emoji}</div>
      {isBot ? <p className="eyebrow">Übungsgegner</p> : null}
      <h3>{candidate.name}</h3>
      <p className="muted">
        Level {candidate.level} · Staerke {calculatePower(candidate)} ·{" "}
        {candidate.deck.length} Karten
      </p>
      <form action={challengeCharacter}>
        <input name="defenderCharacterId" type="hidden" value={candidate.id} />
        <button className="button" type="submit">
          Herausfordern
        </button>
      </form>
    </article>
  );
}

export default async function OpponentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, character } = await requireCharacter();
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  const player = await fetchCharacterLoadout(supabase, character.id);

  if (!player) {
    return null;
  }

  const { allIds, botIds, playerIds, hasRealPlayers } =
    await fetchOpponentCharacterIds(supabase, character.user_id);

  const candidates = await fetchCharacterLoadouts(supabase, allIds);
  const botCandidates = candidates.filter((candidate) => botIds.includes(candidate.id));
  const playerCandidates = candidates.filter((candidate) =>
    playerIds.includes(candidate.id),
  );

  const match = findBestAutomaticOpponent({ player, candidates });

  return (
    <>
      <section>
        <p className="eyebrow">Gegner suchen</p>
        <h1>Waehle einen Gegner fuer deinen naechsten Kampf.</h1>
        <p className="lead">
          {hasRealPlayers
            ? "Du kannst echte Spieler oder Übungsgegner herausfordern. Der Kampf laeuft sofort ab."
            : "Bis mehr Spieler mitmachen, stehen zehn Übungsgegner mit verschiedener Staerke bereit."}
        </p>
      </section>

      {errorMessage ? (
        <p className="muted" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {match ? (
        <section className="section panel battle-card">
          <p className="eyebrow">Passender Gegner</p>
          <h2>
            {match.opponent.emoji} {match.opponent.name}
          </h2>
          <p className="muted">
            {BOT_OPPONENT_IDS.has(match.opponent.id) ? "Übungsgegner · " : ""}
            Staerke {match.opponentPower} · Level {match.opponent.level}
          </p>
          <form action={challengeCharacter}>
            <input
              name="defenderCharacterId"
              type="hidden"
              value={match.opponent.id}
            />
            <button className="button primary" type="submit">
              Herausfordern
            </button>
          </form>
        </section>
      ) : null}

      {playerCandidates.length > 0 ? (
        <section className="section">
          <p className="eyebrow">Echte Spieler</p>
          <div className="feature-grid" aria-label="Echte Gegner">
            {playerCandidates.map((candidate) => (
              <OpponentCard candidate={candidate} key={candidate.id} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <p className="eyebrow">Übungsgegner</p>
        <div className="feature-grid" aria-label="Übungsgegner">
          {botCandidates.map((candidate) => (
            <OpponentCard candidate={candidate} key={candidate.id} />
          ))}
        </div>
      </section>
    </>
  );
}

import { challengeCharacter } from "@/app/battle/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
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

function OpponentRow({ candidate }: { candidate: CharacterLoadout }) {
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
          {isBot ? (
            <span className="fight-opponent-tag">Übung</span>
          ) : null}
        </strong>
        <span className="muted">
          Lv {candidate.level} · {power} · {candidate.deck.length} Karten
        </span>
      </div>
      <form action={challengeCharacter}>
        <input name="defenderCharacterId" type="hidden" value={candidate.id} />
        <SubmitButton pendingLabel="Startet...">Kampf</SubmitButton>
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

  const [player, opponentIds] = await Promise.all([
    fetchCharacterLoadout(supabase, character.id),
    fetchOpponentCharacterIds(supabase, character.user_id),
  ]);

  if (!player) {
    return null;
  }

  const { allIds, botIds, playerIds, hasRealPlayers } = opponentIds;
  const candidates = await fetchCharacterLoadouts(supabase, allIds);
  const botCandidates = candidates.filter((candidate) => botIds.includes(candidate.id));
  const playerCandidates = candidates.filter((candidate) =>
    playerIds.includes(candidate.id),
  );

  const match = findBestAutomaticOpponent({ player, candidates });

  return (
    <div className="fight-page">
      <header className="fight-top panel battle-card">
        <div>
          <p className="eyebrow">Kampf</p>
          <h1>Waehle deinen Gegner.</h1>
          <p className="muted fight-top-lead">
            {hasRealPlayers
              ? "Echte Spieler oder Übungsgegner — der Kampf startet sofort."
              : "Zehn Übungsgegner mit steigender Staerke stehen bereit."}
          </p>
        </div>
      </header>

      {errorMessage ? (
        <p className="muted fight-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {match ? (
        <section className="fight-match panel battle-card">
          <div className="fight-match-copy">
            <p className="eyebrow">Empfohlen</p>
            <div className="fight-match-main">
              <span aria-hidden className="fight-match-emoji">
                {match.opponent.emoji}
              </span>
              <div>
                <h2>{match.opponent.name}</h2>
                <p className="muted">
                  {BOT_OPPONENT_IDS.has(match.opponent.id) ? "Übung · " : ""}
                  Lv {match.opponent.level} · Staerke {match.opponentPower}
                </p>
              </div>
            </div>
          </div>
          <form action={challengeCharacter}>
            <input
              name="defenderCharacterId"
              type="hidden"
              value={match.opponent.id}
            />
            <SubmitButton pendingLabel="Startet..." variant="primary">
              Jetzt kaempfen
            </SubmitButton>
          </form>
        </section>
      ) : null}

      <div
        className={`fight-lists${playerCandidates.length === 0 ? " fight-lists-single" : ""}`}
      >
        {playerCandidates.length > 0 ? (
          <section className="panel battle-card fight-list-card">
            <p className="eyebrow">Echte Spieler</p>
            <div aria-label="Echte Spieler" className="fight-opponent-list">
              {playerCandidates.map((candidate) => (
                <OpponentRow candidate={candidate} key={candidate.id} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="panel battle-card fight-list-card">
          <p className="eyebrow">Übungsgegner</p>
          <div aria-label="Übungsgegner" className="fight-opponent-list">
            {botCandidates.map((candidate) => (
              <OpponentRow candidate={candidate} key={candidate.id} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

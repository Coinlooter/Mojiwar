import { OpponentRow } from "@/components/opponents/OpponentRow";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { challengeCharacter } from "@/app/battle/actions";
import { BOT_OPPONENT_IDS } from "@/constants/bot-opponents";
import { requireCharacter } from "@/lib/auth/require-character";
import { fetchCharacterLoadout, fetchCharacterLoadouts } from "@/lib/game/loadout";
import { findBestAutomaticOpponent } from "@/lib/game/matchmaking";
import { fetchOpponentCharacterIds } from "@/lib/game/opponents";
import {
  getSearchParamErrorMessage,
  OPPONENT_ERROR_MESSAGES,
} from "@/lib/ui/errors";

export const dynamic = "force-dynamic";

export default async function OpponentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, character } = await requireCharacter();
  const params = await searchParams;
  const errorMessage = getSearchParamErrorMessage(
    params.error,
    OPPONENT_ERROR_MESSAGES,
  );

  const [player, opponentIds] = await Promise.all([
    fetchCharacterLoadout(supabase, character.id),
    fetchOpponentCharacterIds(supabase, character.user_id),
  ]);

  if (!player) {
    return (
      <div className="fight-page">
        <section className="panel battle-card">
          <p className="muted">
            Dein Held konnte nicht geladen werden. Versuche es erneut unter
            Dashboard.
          </p>
        </section>
      </div>
    );
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

      {errorMessage ? <AlertBanner>{errorMessage}</AlertBanner> : null}

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

"use client";

import { useState } from "react";

import { OpponentRow } from "@/components/opponents/OpponentRow";
import { ChallengeOpponentButton } from "@/components/opponents/ChallengeOpponentButton";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { BOT_OPPONENT_IDS } from "@/constants/bot-opponents";
import type { CharacterLoadout } from "@/lib/game/types";

export function OpponentsBoard({
  playerEmoji,
  initialErrorMessage,
  match,
  botCandidates,
  playerCandidates,
  hasRealPlayers,
}: {
  playerEmoji: string;
  initialErrorMessage: string | null;
  match: {
    opponent: CharacterLoadout;
    opponentPower: number;
  } | null;
  botCandidates: CharacterLoadout[];
  playerCandidates: CharacterLoadout[];
  hasRealPlayers: boolean;
}) {
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);

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
          <ChallengeOpponentButton
            defenderCharacterId={match.opponent.id}
            onError={setErrorMessage}
            opponentEmoji={match.opponent.emoji}
            opponentName={match.opponent.name}
            playerEmoji={playerEmoji}
          >
            Jetzt kaempfen
          </ChallengeOpponentButton>
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
                <OpponentRow
                  candidate={candidate}
                  key={candidate.id}
                  onError={setErrorMessage}
                  playerEmoji={playerEmoji}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="panel battle-card fight-list-card">
          <p className="eyebrow">Übungsgegner</p>
          <div aria-label="Übungsgegner" className="fight-opponent-list">
            {botCandidates.map((candidate) => (
              <OpponentRow
                candidate={candidate}
                key={candidate.id}
                onError={setErrorMessage}
                playerEmoji={playerEmoji}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

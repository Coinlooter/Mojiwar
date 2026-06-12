"use client";

import { useState } from "react";

import { OpponentRow } from "@/components/opponents/OpponentRow";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type { RankedOpponent } from "@/lib/game/matchmaking";

export function OpponentsBoard({
  playerEmoji,
  playerPower,
  powerRange,
  initialErrorMessage,
  fallbackHint,
  opponents,
}: {
  playerEmoji: string;
  playerPower: number;
  powerRange: { min: number; max: number };
  initialErrorMessage: string | null;
  fallbackHint: string | null;
  opponents: RankedOpponent[];
}) {
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);

  return (
    <div className="fight-page">
      <header className="fight-top panel battle-card">
        <div>
          <p className="eyebrow">Kampf</p>
          <h1>Wähle deinen Gegner.</h1>
          <p className="muted fight-top-lead">
            Deine Stärke: {playerPower}. Angreifbar sind Gegner zwischen{" "}
            {powerRange.min} und {powerRange.max} (−6 % bis +10 %).
          </p>
        </div>
      </header>

      {errorMessage ? <AlertBanner>{errorMessage}</AlertBanner> : null}
      {fallbackHint && opponents.length > 0 ? (
        <p className="fight-opponents-hint panel battle-card">{fallbackHint}</p>
      ) : null}

      <section className="panel battle-card fight-list-card">
        <div className="fight-list-head">
          <p className="eyebrow">Gegner</p>
          <span className="fight-list-count">
            {opponents.length} {opponents.length === 1 ? "Gegner" : "Gegner"}
          </span>
        </div>

        {opponents.length === 0 ? (
          <p className="muted fight-opponents-empty">
            {fallbackHint ??
              "Gerade ist niemand in deiner Stärkeklasse online. Rüste dein Deck aus oder komm später wieder."}
          </p>
        ) : (
          <div aria-label="Gegnerliste" className="fight-opponent-list">
            {opponents.map((entry, index) => (
              <OpponentRow
                candidate={entry.candidate}
                key={entry.candidate.id}
                onError={setErrorMessage}
                playerEmoji={playerEmoji}
                power={entry.power}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

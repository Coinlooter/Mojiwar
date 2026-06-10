"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function BattleLaunchOverlay({
  playerEmoji,
  opponentEmoji,
  opponentName,
  statusLabel,
}: {
  playerEmoji: string;
  opponentEmoji: string;
  opponentName: string;
  statusLabel: string;
}) {
  return (
    <div aria-live="polite" className="battle-launch-overlay" role="status">
      <div className="battle-launch-backdrop" aria-hidden="true" />
      <article className="battle-launch-card panel battle-card">
        <p className="eyebrow">Kampf</p>
        <div className="battle-launch-emojis">
          <span aria-hidden className="battle-launch-fighter battle-launch-fighter-player">
            {playerEmoji}
          </span>
          <span aria-hidden className="battle-launch-vs">
            VS
          </span>
          <span aria-hidden className="battle-launch-fighter battle-launch-fighter-opponent">
            {opponentEmoji}
          </span>
        </div>
        <p className="battle-launch-opponent">
          Gegen <strong>{opponentName}</strong>
        </p>
        <p className="battle-launch-label">{statusLabel}</p>
        <div className="battle-launch-spinner">
          <LoadingSpinner label="Kampf wird vorbereitet" />
        </div>
      </article>
    </div>
  );
}

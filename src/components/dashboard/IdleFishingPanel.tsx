"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { claimFishingReward } from "@/app/dashboard/actions";
import type { FishingReward } from "@/lib/game/fishing";
import { summarizeFishingFish } from "@/lib/game/fishing";

const CLAIM_ERROR_MESSAGE =
  "Die Angelbeute konnte gerade nicht abgeholt werden. Bitte versuche es erneut.";

export function IdleFishingPanel({
  characterEmoji,
  reward,
}: {
  characterEmoji: string;
  reward: FishingReward;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const fishSummary = summarizeFishingFish(reward.fish);

  function handleClaim() {
    setClaimError(null);
    setClaimMessage(null);

    startTransition(async () => {
      const result = await claimFishingReward();

      if (!result.ok) {
        if (result.error === "empty") {
          setClaimError("Noch keine Beute — dein Emoji angelt weiter.");
          return;
        }

        setClaimError(CLAIM_ERROR_MESSAGE);
        return;
      }

      setClaimMessage(`+${result.totalGold} 🪙 Gold abgeholt!`);
      router.refresh();
    });
  }

  return (
    <section aria-label="Idle Angeln" className="panel battle-card fishing-panel">
      <div className="dashboard-section-head">
        <p className="eyebrow">Angeln</p>
        <p className="muted fishing-panel-copy">
          Dein Emoji angelt am See, während du weg bist. Hole die Beute ab und starte
          einen neuen Fang.
        </p>
      </div>

      <div className="fishing-scene">
        <div aria-hidden="true" className="fishing-scene-backdrop" />
        <div className="fishing-scene-stage">
          <span aria-hidden className="fishing-character-emoji">
            {characterEmoji}
          </span>
        </div>
      </div>

      <div className="fishing-reward-summary">
        {reward.hasReward ? (
          <>
            <p className="fishing-reward-total">
              <strong>{reward.totalGold} 🪙</strong> warten auf dich
            </p>
            <p className="muted fishing-reward-breakdown">
              {reward.baseGold} 🪙 passives Gold
              {reward.fishGold > 0 ? ` · ${reward.fishGold} 🪙 aus Fängen` : ""}
            </p>
            {fishSummary.length > 0 ? (
              <ul className="fishing-catch-list">
                {fishSummary.map((entry) => (
                  <li key={entry.emoji}>
                    <span aria-hidden>{entry.emoji}</span>
                    <span>
                      {entry.count}× · {entry.count * entry.gold} 🪙
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="muted fishing-reward-empty">
            Noch keine Beute — dein Emoji wirft die Angel aus.
          </p>
        )}
      </div>

      {claimMessage ? <p className="fishing-feedback fishing-feedback-success">{claimMessage}</p> : null}
      {claimError ? <p className="fishing-feedback fishing-feedback-error">{claimError}</p> : null}

      <button
        className="button primary fishing-claim-button"
        disabled={!reward.hasReward || isPending}
        onClick={handleClaim}
        type="button"
      >
        {isPending ? "Wird abgeholt..." : "Beute abholen"}
      </button>
    </section>
  );
}

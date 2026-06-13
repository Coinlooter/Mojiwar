"use client";

import { useEffect, useState } from "react";

export type FishingPhase = "idle" | "cast" | "wait" | "bite" | "reel" | "catching";

const PHASE_SEQUENCE: FishingPhase[] = ["idle", "cast", "wait", "bite", "reel"];

const PHASE_DURATIONS: Record<FishingPhase, number> = {
  idle: 2200,
  cast: 900,
  wait: 2800,
  bite: 550,
  reel: 1300,
  catching: 1500,
};

const LOOP_FISH = ["🐟", "🐠", "🐡"] as const;

type CatchDisplay = {
  fish: string;
  gold: number;
};

export function FishingScene({
  characterEmoji,
  hasReward,
  forcedPhase = null,
  catchDisplay = null,
}: {
  characterEmoji: string;
  hasReward: boolean;
  forcedPhase?: FishingPhase | null;
  catchDisplay?: CatchDisplay | null;
}) {
  const [phase, setPhase] = useState<FishingPhase>("idle");
  const [loopFish, setLoopFish] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const activePhase = forcedPhase ?? phase;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setPrefersReducedMotion(media.matches);
    };

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => {
      media.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || forcedPhase) {
      return;
    }

    const waitDuration = hasReward && phase === "wait" ? 1800 : PHASE_DURATIONS.wait;
    const duration =
      phase === "wait"
        ? waitDuration
        : PHASE_DURATIONS[phase];

    const timer = window.setTimeout(() => {
      const currentIndex = PHASE_SEQUENCE.indexOf(phase);
      const nextPhase = PHASE_SEQUENCE[(currentIndex + 1) % PHASE_SEQUENCE.length];

      if (nextPhase === "reel") {
        setLoopFish(LOOP_FISH[(currentIndex + 1) % LOOP_FISH.length] ?? "🐟");
      } else {
        setLoopFish(null);
      }

      setPhase(nextPhase);
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [forcedPhase, hasReward, phase, prefersReducedMotion]);

  useEffect(() => {
    if (!forcedPhase) {
      return;
    }

    setLoopFish(null);
  }, [forcedPhase]);

  const sceneClasses = [
    "fishing-scene",
    `is-phase-${activePhase}`,
    hasReward ? "has-reward" : "",
    prefersReducedMotion ? "prefers-reduced-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const displayedFish = catchDisplay?.fish ?? loopFish;

  return (
    <div className={sceneClasses}>
      <div aria-hidden="true" className="fishing-scene-backdrop" />

      <div aria-hidden="true" className="fishing-water-ripples">
        <span className="fishing-ripple fishing-ripple-1" />
        <span className="fishing-ripple fishing-ripple-2" />
        <span className="fishing-ripple fishing-ripple-3" />
      </div>

      <div className="fishing-scene-stage">
        <div className="fishing-angler-wrap">
          <div className="fishing-angler">
            <span aria-hidden className="fishing-character-emoji">
              {characterEmoji}
            </span>
            <span aria-hidden className="fishing-rod">
              🎣
            </span>
          </div>

          <div className="fishing-rig">
            <div className="fishing-line" />
            <span className="fishing-bobber" />
          </div>
        </div>

        {displayedFish ? (
          <span aria-hidden className="fishing-loop-fish">
            {displayedFish}
          </span>
        ) : null}

        {catchDisplay ? (
          <span aria-hidden className="fishing-catch-floater">
            +{catchDisplay.gold} 🪙
          </span>
        ) : null}

        <span aria-hidden className="fishing-splash" />
      </div>
    </div>
  );
}

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
          <span aria-hidden className="fishing-bucket">
            🪣
          </span>
          <span aria-hidden className="fishing-character-emoji">
            {characterEmoji}
          </span>

          <div aria-hidden className="fishing-rod-pivot">
            <svg
              className="fishing-rod-svg"
              fill="none"
              viewBox="0 0 80 120"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 112 C28 78 48 38 72 10"
                stroke="#5c3d22"
                strokeLinecap="round"
                strokeWidth="6"
              />
              <path
                d="M18 112 C28 78 48 38 72 10"
                stroke="#9a6b42"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
              <circle cx="18" cy="112" fill="#4a3020" r="5" />
              <circle cx="72" cy="10" fill="#d8dee8" r="3.5" stroke="#8b95a7" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        <svg
          aria-hidden
          className="fishing-line-svg"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <line className="fishing-line-stroke" x1="57" x2="84" y1="38" y2="74" />
        </svg>

        <span aria-hidden className="fishing-bobber-hook">
          🪝
        </span>

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

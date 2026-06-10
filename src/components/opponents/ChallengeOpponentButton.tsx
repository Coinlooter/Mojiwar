"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";

import { startChallenge, type ChallengeError } from "@/app/battle/actions";
import { BattleLaunchOverlay } from "@/components/battle/BattleLaunchOverlay";
import { OPPONENT_ERROR_MESSAGES } from "@/lib/ui/errors";

const LAUNCH_MESSAGES = [
  "Gegner wird geladen...",
  "Arena wird vorbereitet...",
  "Kampf startet gleich...",
] as const;

export function ChallengeOpponentButton({
  defenderCharacterId,
  playerEmoji,
  opponentEmoji,
  opponentName,
  children,
  className = "button primary",
  onError,
}: {
  defenderCharacterId: string;
  playerEmoji: string;
  opponentEmoji: string;
  opponentName: string;
  children: ReactNode;
  className?: string;
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLaunching, setIsLaunching] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLaunching) {
      return;
    }

    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % LAUNCH_MESSAGES.length);
    }, 1200);

    return () => {
      window.clearInterval(interval);
    };
  }, [isLaunching]);

  function finishWithError(error: ChallengeError) {
    setIsLaunching(false);
    setMessageIndex(0);
    onError?.(OPPONENT_ERROR_MESSAGES[error] ?? OPPONENT_ERROR_MESSAGES.battle);
  }

  function handleChallenge() {
    if (isPending || isLaunching) {
      return;
    }

    setIsLaunching(true);
    setMessageIndex(0);

    startTransition(() => {
      void (async () => {
        const result = await startChallenge(defenderCharacterId);

        if (!result.ok) {
          finishWithError(result.error);
          return;
        }

        router.push(`/battle/${result.battleId}` as Route);
      })();
    });
  }

  return (
    <>
      <button
        aria-busy={isPending || isLaunching}
        className={`${className}${isPending || isLaunching ? " is-loading" : ""}`}
        disabled={isPending || isLaunching}
        onClick={handleChallenge}
        type="button"
      >
        {isPending || isLaunching ? "Startet..." : children}
      </button>

      {isLaunching ? (
        <BattleLaunchOverlay
          opponentEmoji={opponentEmoji}
          opponentName={opponentName}
          playerEmoji={playerEmoji}
          statusLabel={LAUNCH_MESSAGES[messageIndex]}
        />
      ) : null}
    </>
  );
}

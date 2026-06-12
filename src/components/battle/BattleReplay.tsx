"use client";

import { useEffect, useMemo, useState } from "react";

import { BattleArena } from "@/components/battle/BattleArena";
import type { BattleEvent, BattleResult } from "@/lib/game/types";

const EVENT_STEP_MS = 1100;

export function BattleReplay({
  result,
  onComplete,
}: {
  result: BattleResult;
  onComplete?: () => void;
}) {
  const [visibleEvents, setVisibleEvents] = useState(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const shownEventCount = prefersReducedMotion
    ? result.events.length
    : visibleEvents;
  const shownEvents = result.events.slice(0, shownEventCount);
  const isComplete = shownEventCount >= result.events.length;
  const fighterHp = useMemo(
    () => deriveFighterHp(result, shownEvents),
    [result, shownEvents],
  );
  const currentRound = useMemo(
    () => deriveCurrentRound(shownEvents),
    [shownEvents],
  );

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
    if (prefersReducedMotion || isComplete) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVisibleEvents((count) => Math.min(count + 1, result.events.length));
    }, EVENT_STEP_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isComplete, prefersReducedMotion, result.events.length, visibleEvents]);

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    onComplete?.();
  }, [isComplete, onComplete]);

  return (
    <div className="battle-replay-compact" aria-label="Kampf-Replay">
      <header className="battle-replay-header">
        <div>
          <p className="eyebrow">Kampf-Arena</p>
          <p className="muted battle-replay-subtitle">
            {result.attackerSnapshot.emoji} {result.attackerSnapshot.name} vs{" "}
            {result.defenderSnapshot.emoji} {result.defenderSnapshot.name}
          </p>
        </div>
        <p className="battle-round-pill">
          {isComplete ? "Beendet" : `Runde ${currentRound}`}
        </p>
      </header>

      <div className="battle-replay-body">
        <BattleArena
          animate={!prefersReducedMotion}
          events={shownEvents}
          fighterHp={fighterHp}
          result={result}
        />
      </div>

      <footer className="battle-replay-footer">
        <p className="muted replay-status" aria-live="polite">
          {isComplete
            ? "Ergebnis folgt gleich..."
            : "Die Emojis kämpfen in der Arena..."}
        </p>
        <button
          className="button"
          disabled={isComplete}
          onClick={() => {
            setVisibleEvents(result.events.length);
          }}
          type="button"
        >
          {isComplete ? "Fertig" : "Überspringen"}
        </button>
      </footer>
    </div>
  );
}

function deriveCurrentRound(events: BattleEvent[]) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];

    if (event.round > 0) {
      return event.round;
    }
  }

  return 0;
}

function deriveFighterHp(result: BattleResult, events: BattleEvent[]) {
  let attackerHp = result.attackerSnapshot.finalStats.hp;
  let defenderHp = result.defenderSnapshot.finalStats.hp;

  for (const event of events) {
    if (event.type === "attack") {
      if (event.target === "attacker") {
        attackerHp = event.targetHpAfter;
      } else {
        defenderHp = event.targetHpAfter;
      }
    }

    if (event.type === "card_effect") {
      if (event.target === "attacker") {
        attackerHp = event.targetHpAfter ?? attackerHp;
      }

      if (event.target === "defender") {
        defenderHp = event.targetHpAfter ?? defenderHp;
      }

      if (event.actorHpAfter !== undefined) {
        if (event.actor === "attacker") {
          attackerHp = event.actorHpAfter;
        } else {
          defenderHp = event.actorHpAfter;
        }
      }
    }

    if (event.type === "battle_finished") {
      attackerHp = event.attackerHp;
      defenderHp = event.defenderHp;
    }
  }

  return { attacker: attackerHp, defender: defenderHp };
}

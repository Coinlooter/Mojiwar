"use client";

import { useEffect, useMemo, useState } from "react";

import type { BattleEvent, BattleResult, FighterSide } from "@/lib/game/types";

const sideLabel: Record<FighterSide, string> = {
  attacker: "Angreifer",
  defender: "Verteidiger",
};

const EVENT_STEP_MS = 900;

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
    <section className="replay-shell" aria-label="Kampf-Replay">
      <div className="panel battle-card">
        <p className="eyebrow">Replay · Regeln v{result.rulesVersion}</p>
        <div className="fighter-row">
          <FighterPanel
            emoji={result.attackerSnapshot.emoji}
            hp={fighterHp.attacker}
            maxHp={result.attackerSnapshot.finalStats.hp}
            name={result.attackerSnapshot.name}
            power={result.attackerSnapshot.power}
          />
          <strong>VS</strong>
          <FighterPanel
            emoji={result.defenderSnapshot.emoji}
            hp={fighterHp.defender}
            maxHp={result.defenderSnapshot.finalStats.hp}
            name={result.defenderSnapshot.name}
            power={result.defenderSnapshot.power}
          />
        </div>

        <div className="actions">
          {!isComplete ? (
            <p className="muted replay-status" aria-live="polite">
              Kampf laeuft automatisch ab...
            </p>
          ) : (
            <p className="muted replay-status" aria-live="polite">
              Kampf beendet.
            </p>
          )}
          <button
            className="button"
            disabled={isComplete}
            onClick={() => setVisibleEvents(result.events.length)}
            type="button"
          >
            Ueberspringen
          </button>
        </div>
      </div>

      <aside className="panel battle-card">
        <p className="eyebrow">Kampf-Log</p>
        <div className="event-list" aria-live="polite">
          {shownEvents.map((event, index) => (
            <BattleEventCard
              event={event}
              isLatest={index === shownEvents.length - 1 && !isComplete}
              key={`${event.type}-${event.round}-${index}`}
            />
          ))}
        </div>
      </aside>
    </section>
  );
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

function FighterPanel({
  emoji,
  name,
  power,
  hp,
  maxHp,
}: {
  emoji: string;
  name: string;
  power: number;
  hp: number;
  maxHp: number;
}) {
  return (
    <div className="fighter">
      <div className="emoji">{emoji}</div>
      <h3>{name}</h3>
      <p className="muted">
        Power {power} · {hp}/{maxHp} HP
      </p>
    </div>
  );
}

function BattleEventCard({
  event,
  isLatest,
}: {
  event: BattleEvent;
  isLatest: boolean;
}) {
  return (
    <article className={`event-card${isLatest ? " event-card-latest" : ""}`}>
      <strong>{formatEventTitle(event)}</strong>
      <p className="muted" style={{ margin: "6px 0 0" }}>
        {formatEventDetails(event)}
      </p>
    </article>
  );
}

function formatEventTitle(event: BattleEvent) {
  switch (event.type) {
    case "battle_started":
      return "Kampf startet";
    case "attack":
      return `Runde ${event.round}: ${sideLabel[event.actor]} greift an`;
    case "card_effect":
      return `Runde ${event.round}: ${event.cardName}`;
    case "fighter_defeated":
      return `${sideLabel[event.loser]} faellt`;
    case "battle_finished":
      return `Gewinner: ${sideLabel[event.winner]}`;
  }
}

function formatEventDetails(event: BattleEvent) {
  switch (event.type) {
    case "battle_started":
      return `${event.attacker.emoji} ${event.attacker.name} fordert ${event.defender.emoji} ${event.defender.name} heraus.`;
    case "attack":
      return `${event.damage} Schaden${event.critical ? " als kritischer Treffer" : ""}. Ziel-HP: ${event.targetHpAfter}.`;
    case "card_effect":
      if (event.actorHpAfter !== undefined) {
        return `${sideLabel[event.actor]} heilt sich um ${event.value}. HP: ${event.actorHpAfter}.`;
      }

      return `${sideLabel[event.actor]} nutzt einen Karteneffekt fuer ${event.value} Schaden. Ziel-HP: ${event.targetHpAfter}.`;
    case "fighter_defeated":
      return `${sideLabel[event.winner]} entscheidet den Kampf.`;
    case "battle_finished":
      return `Endstand: Angreifer ${event.attackerHp} HP, Verteidiger ${event.defenderHp} HP.`;
  }
}

"use client";

import { useState } from "react";

import type { BattleEvent, BattleResult, FighterSide } from "@/lib/game/types";

const sideLabel: Record<FighterSide, string> = {
  attacker: "Angreifer",
  defender: "Verteidiger",
};

export function BattleReplay({ result }: { result: BattleResult }) {
  const [visibleEvents, setVisibleEvents] = useState(4);
  const shownEvents = result.events.slice(0, visibleEvents);
  const isComplete = visibleEvents >= result.events.length;

  return (
    <section className="replay-shell" aria-label="Kampf-Replay">
      <div className="panel battle-card">
        <p className="eyebrow">Replay · Regeln v{result.rulesVersion}</p>
        <div className="fighter-row">
          <FighterPanel
            emoji={result.attackerSnapshot.emoji}
            name={result.attackerSnapshot.name}
            power={result.attackerSnapshot.power}
            hp={result.attackerSnapshot.finalStats.hp}
          />
          <strong>VS</strong>
          <FighterPanel
            emoji={result.defenderSnapshot.emoji}
            name={result.defenderSnapshot.name}
            power={result.defenderSnapshot.power}
            hp={result.defenderSnapshot.finalStats.hp}
          />
        </div>

        <div className="actions">
          <button
            className="button primary"
            type="button"
            onClick={() => setVisibleEvents((count) => Math.min(count + 2, result.events.length))}
            disabled={isComplete}
          >
            Naechste Events
          </button>
          <button
            className="button"
            type="button"
            onClick={() => setVisibleEvents(result.events.length)}
            disabled={isComplete}
          >
            Ueberspringen
          </button>
        </div>
      </div>

      <aside className="panel battle-card">
        <p className="eyebrow">Kampf-Log</p>
        <div className="event-list">
          {shownEvents.map((event, index) => (
            <BattleEventCard event={event} key={`${event.type}-${event.round}-${index}`} />
          ))}
        </div>
      </aside>
    </section>
  );
}

function FighterPanel({
  emoji,
  name,
  power,
  hp,
}: {
  emoji: string;
  name: string;
  power: number;
  hp: number;
}) {
  return (
    <div className="fighter">
      <div className="emoji">{emoji}</div>
      <h3>{name}</h3>
      <p className="muted">
        Power {power} · {hp} HP
      </p>
    </div>
  );
}

function BattleEventCard({ event }: { event: BattleEvent }) {
  return (
    <article className="event-card">
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

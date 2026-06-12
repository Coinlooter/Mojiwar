import type { BattleEvent, FighterSide } from "@/lib/game/types";

const sideLabel: Record<FighterSide, string> = {
  attacker: "Angreifer",
  defender: "Verteidiger",
};

export function BattleLog({
  events,
  highlightLatest = false,
  className = "",
}: {
  events: BattleEvent[];
  highlightLatest?: boolean;
  className?: string;
}) {
  return (
    <div className={["event-list", className].filter(Boolean).join(" ")}>
      {events.map((event, index) => (
        <BattleEventCard
          event={event}
          isLatest={highlightLatest && index === events.length - 1}
          key={`${event.type}-${event.round}-${index}`}
        />
      ))}
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
      <p className="muted event-card-detail">{formatEventDetails(event)}</p>
    </article>
  );
}

function formatEventTitle(event: BattleEvent) {
  switch (event.type) {
    case "battle_started":
      return "Kampf startet";
    case "attack":
      return `R${event.round}: ${sideLabel[event.actor]}`;
    case "card_effect":
      return `R${event.round}: ${event.cardName}`;
    case "fighter_defeated":
      return `${sideLabel[event.loser]} fällt`;
    case "battle_finished":
      return `Sieg: ${sideLabel[event.winner]}`;
  }
}

function formatEventDetails(event: BattleEvent) {
  switch (event.type) {
    case "battle_started":
      return `${event.attacker.emoji} vs ${event.defender.emoji}`;
    case "attack":
      return `${event.damage} Schaden${event.critical ? " · Krit" : ""}`;
    case "card_effect":
      if (event.actorHpAfter !== undefined) {
        return `+${event.value} Heilung`;
      }

      return `${event.value} Schaden`;
    case "fighter_defeated":
      return `${sideLabel[event.winner]} gewinnt`;
    case "battle_finished":
      return `${event.attackerHp} / ${event.defenderHp} HP`;
  }
}

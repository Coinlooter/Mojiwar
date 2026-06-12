"use client";

import { useMemo } from "react";

import type { BattleEvent, BattleResult, FighterSide } from "@/lib/game/types";

type Floater = {
  id: string;
  side: FighterSide;
  value: string;
  kind: "damage" | "heal" | "critical";
};

type ArenaMoment =
  | { kind: "idle" }
  | { kind: "attack"; actor: FighterSide; target: FighterSide; critical: boolean }
  | { kind: "card_damage"; actor: FighterSide; target: FighterSide }
  | { kind: "heal"; actor: FighterSide }
  | { kind: "defeated"; loser: FighterSide }
  | { kind: "start" };

export function BattleArena({
  result,
  events,
  fighterHp,
  animate,
}: {
  result: BattleResult;
  events: BattleEvent[];
  fighterHp: { attacker: number; defender: number };
  animate: boolean;
}) {
  const moment = useMemo(
    () => (animate ? deriveMoment(events) : { kind: "idle" as const }),
    [animate, events],
  );

  const floaters = useMemo(
    () => (animate ? deriveFloaters(events) : []),
    [animate, events],
  );

  const latestCombatEvent = useMemo(() => findLatestCombatEvent(events), [events]);

  const attackerMaxHp = result.attackerSnapshot.finalStats.hp;
  const defenderMaxHp = result.defenderSnapshot.finalStats.hp;
  const attackerHpRatio = Math.max(0, fighterHp.attacker / attackerMaxHp);
  const defenderHpRatio = Math.max(0, fighterHp.defender / defenderMaxHp);

  const attackerClasses = buildFighterClasses("attacker", moment, latestCombatEvent);
  const defenderClasses = buildFighterClasses("defender", moment, latestCombatEvent);

  const arenaClasses = [
    "battle-arena",
    moment.kind === "attack" && moment.critical ? "battle-arena-critical" : "",
    moment.kind === "card_damage" ? "battle-arena-magic" : "",
    moment.kind === "heal" ? "battle-arena-heal" : "",
    moment.kind === "start" ? "battle-arena-start" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={arenaClasses}>
      <div aria-hidden="true" className="battle-arena-backdrop" />

      <div className="battle-arena-hud">
        <FighterHud
          emoji={result.attackerSnapshot.emoji}
          hp={fighterHp.attacker}
          hpRatio={attackerHpRatio}
          maxHp={attackerMaxHp}
          name={result.attackerSnapshot.name}
          power={result.attackerSnapshot.power}
          side="attacker"
        />
        <FighterHud
          emoji={result.defenderSnapshot.emoji}
          hp={fighterHp.defender}
          hpRatio={defenderHpRatio}
          maxHp={defenderMaxHp}
          name={result.defenderSnapshot.name}
          power={result.defenderSnapshot.power}
          side="defender"
        />
      </div>

      <div className="battle-arena-stage">
        <FighterSprite
          animationKey={events.length}
          classes={attackerClasses}
          emoji={result.attackerSnapshot.emoji}
          floaters={floaters.filter((floater) => floater.side === "attacker")}
          side="attacker"
        />

        <FighterSprite
          animationKey={events.length}
          classes={defenderClasses}
          emoji={result.defenderSnapshot.emoji}
          floaters={floaters.filter((floater) => floater.side === "defender")}
          side="defender"
        />
      </div>

      <EffectBurst animationKey={events.length} moment={moment} />
    </div>
  );
}

function FighterHud({
  side,
  name,
  emoji,
  power,
  hp,
  maxHp,
  hpRatio,
}: {
  side: FighterSide;
  name: string;
  emoji: string;
  power: number;
  hp: number;
  maxHp: number;
  hpRatio: number;
}) {
  const lowHp = hpRatio <= 0.3 && hp > 0;

  return (
    <article className={`battle-fighter-hud battle-fighter-hud-${side}`}>
      <div className="battle-fighter-meta">
        <h3>
          {emoji} {name}
        </h3>
        <p className="muted">Power {power}</p>
      </div>

      <div className="battle-hp">
        <div
          className="battle-hp-track"
          role="progressbar"
          aria-valuemax={maxHp}
          aria-valuemin={0}
          aria-valuenow={hp}
        >
          <div
            className={`battle-hp-fill${lowHp ? " battle-hp-fill-low" : ""}`}
            style={{ width: `${hpRatio * 100}%` }}
          />
        </div>
        <span className="battle-hp-label">
          {hp}/{maxHp} HP
        </span>
      </div>
    </article>
  );
}

function FighterSprite({
  side,
  emoji,
  classes,
  floaters,
  animationKey,
}: {
  side: FighterSide;
  emoji: string;
  classes: string;
  floaters: Floater[];
  animationKey: number;
}) {
  return (
    <article className={`battle-fighter battle-fighter-${side} ${classes}`}>
      <div className="battle-fighter-sprite-wrap">
        <div className="battle-fighter-shadow" />
        <div className="battle-fighter-sprite" key={`sprite-${animationKey}`}>
          {emoji}
        </div>
        {floaters.map((floater) => (
          <span
            className={`battle-float battle-float-${floater.kind}`}
            key={floater.id}
          >
            {floater.value}
          </span>
        ))}
      </div>
    </article>
  );
}

function EffectBurst({
  moment,
  animationKey,
}: {
  moment: ArenaMoment;
  animationKey: number;
}) {
  if (moment.kind === "attack") {
    return (
      <div
        aria-hidden="true"
        className={`battle-effect-burst battle-effect-burst-${moment.target}${moment.critical ? " battle-effect-burst-critical" : ""}`}
        key={`burst-${animationKey}`}
      >
        {moment.critical ? "💥" : "✨"}
      </div>
    );
  }

  if (moment.kind === "card_damage") {
    return (
      <div
        aria-hidden="true"
        className={`battle-effect-burst battle-effect-burst-${moment.target} battle-effect-burst-magic`}
        key={`burst-${animationKey}`}
      >
        🔮
      </div>
    );
  }

  if (moment.kind === "heal") {
    return (
      <div
        aria-hidden="true"
        className={`battle-effect-burst battle-effect-burst-${moment.actor} battle-effect-burst-heal`}
        key={`burst-${animationKey}`}
      >
        💚
      </div>
    );
  }

  return null;
}

function deriveMoment(events: BattleEvent[]): ArenaMoment {
  const latest = events[events.length - 1];

  if (!latest) {
    return { kind: "idle" };
  }

  if (latest.type === "battle_started") {
    return { kind: "start" };
  }

  if (latest.type === "attack") {
    return {
      kind: "attack",
      actor: latest.actor,
      target: latest.target,
      critical: latest.critical,
    };
  }

  if (latest.type === "card_effect") {
    if (latest.actorHpAfter !== undefined) {
      return { kind: "heal", actor: latest.actor };
    }

    if (latest.target) {
      return {
        kind: "card_damage",
        actor: latest.actor,
        target: latest.target,
      };
    }
  }

  if (latest.type === "fighter_defeated") {
    return { kind: "defeated", loser: latest.loser };
  }

  return { kind: "idle" };
}

function deriveFloaters(events: BattleEvent[]): Floater[] {
  const latest = events[events.length - 1];

  if (!latest) {
    return [];
  }

  if (latest.type === "attack") {
    return [
      {
        id: `attack-${events.length}`,
        side: latest.target,
        value: `-${latest.damage}`,
        kind: latest.critical ? "critical" : "damage",
      },
    ];
  }

  if (latest.type === "card_effect") {
    if (latest.actorHpAfter !== undefined) {
      return [
        {
          id: `heal-${events.length}`,
          side: latest.actor,
          value: `+${latest.value}`,
          kind: "heal",
        },
      ];
    }

    if (latest.target) {
      return [
        {
          id: `card-${events.length}`,
          side: latest.target,
          value: `-${latest.value}`,
          kind: "damage",
        },
      ];
    }
  }

  return [];
}

function findLatestCombatEvent(events: BattleEvent[]) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];

    if (
      event.type === "attack" ||
      event.type === "card_effect" ||
      event.type === "fighter_defeated"
    ) {
      return event;
    }
  }

  return null;
}

function buildFighterClasses(
  side: FighterSide,
  moment: ArenaMoment,
  latestCombatEvent: BattleEvent | null,
) {
  const classes: string[] = [];

  if (moment.kind === "start") {
    classes.push("is-entering");
  }

  if (moment.kind === "attack" && moment.actor === side) {
    classes.push("is-attacking");
  }

  if (moment.kind === "attack" && moment.target === side) {
    classes.push(moment.critical ? "is-hit-critical" : "is-hit");
  }

  if (moment.kind === "card_damage" && moment.actor === side) {
    classes.push("is-casting");
  }

  if (moment.kind === "card_damage" && moment.target === side) {
    classes.push("is-hit");
  }

  if (moment.kind === "heal" && moment.actor === side) {
    classes.push("is-healing");
  }

  if (moment.kind === "defeated" && moment.loser === side) {
    classes.push("is-defeated");
  }

  if (
    latestCombatEvent?.type === "fighter_defeated" &&
    latestCombatEvent.loser === side
  ) {
    classes.push("is-defeated");
  }

  if (
    latestCombatEvent?.type === "fighter_defeated" &&
    latestCombatEvent.winner === side
  ) {
    classes.push("is-victorious");
  }

  return classes.join(" ");
}

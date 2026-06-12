import { getCombatAffixes } from "./card-affixes";
import { applyLoadoutBonuses, calculatePower } from "./calculate-power";
import { calculateBattleXp } from "./leveling";
import { createSeededRandom } from "./random";
import type {
  BattleEvent,
  BattleParticipantSnapshot,
  BattleResult,
  CardAffix,
  CardDefinition,
  CharacterLoadout,
  FighterSide,
} from "./types";

export const BATTLE_RULES_VERSION = 1;
const MAX_ROUNDS = 30;

type RuntimeFighter = {
  side: FighterSide;
  loadout: CharacterLoadout;
  snapshot: BattleParticipantSnapshot;
  currentHp: number;
  lowHpHealUsed: boolean;
  openingBarrierUsed: boolean;
};

export function simulateBattle({
  attacker,
  defender,
  seed,
}: {
  attacker: CharacterLoadout;
  defender: CharacterLoadout;
  seed: string;
}): BattleResult {
  const random = createSeededRandom(seed);
  const attackerRuntime = createRuntimeFighter("attacker", attacker);
  const defenderRuntime = createRuntimeFighter("defender", defender);
  const events: BattleEvent[] = [
    {
      type: "battle_started",
      round: 0,
      attacker: attackerRuntime.snapshot,
      defender: defenderRuntime.snapshot,
    },
  ];

  let winner: RuntimeFighter | null = null;
  let loser: RuntimeFighter | null = null;
  let finalRound = 0;

  for (let round = 1; round <= MAX_ROUNDS; round += 1) {
    finalRound = round;
    const order = getTurnOrder(attackerRuntime, defenderRuntime, round);

    for (const actor of order) {
      const target = actor.side === "attacker" ? defenderRuntime : attackerRuntime;

      if (actor.currentHp <= 0 || target.currentHp <= 0) {
        continue;
      }

      applyFirstStrike({
        actor,
        target,
        round,
        events,
      });

      if (target.currentHp <= 0) {
        winner = actor;
        loser = target;
        break;
      }

      const attackEvents = performAttack({
        actor,
        target,
        round,
        random,
      });
      events.push(...attackEvents);

      applyLowHpHeal({
        fighter: target,
        round,
        events,
      });

      if (target.currentHp <= 0) {
        winner = actor;
        loser = target;
        break;
      }
    }

    if (winner && loser) {
      events.push({
        type: "fighter_defeated",
        round,
        loser: loser.side,
        winner: winner.side,
      });
      break;
    }
  }

  if (!winner || !loser) {
    const attackerScore = attackerRuntime.currentHp + attackerRuntime.snapshot.power * 0.02;
    const defenderScore = defenderRuntime.currentHp + defenderRuntime.snapshot.power * 0.02;

    winner = attackerScore >= defenderScore ? attackerRuntime : defenderRuntime;
    loser = winner.side === "attacker" ? defenderRuntime : attackerRuntime;
  }

  const xp =
    winner.side === "attacker"
      ? calculateBattleXp({ winner: attacker, loser: defender })
      : calculateBattleXp({ winner: defender, loser: attacker });

  const resultXp =
    winner.side === "attacker"
      ? { attacker: xp.winnerXp, defender: xp.loserXp }
      : { attacker: xp.loserXp, defender: xp.winnerXp };

  events.push({
    type: "battle_finished",
    round: finalRound,
    winner: winner.side,
    loser: loser.side,
    attackerHp: Math.max(0, attackerRuntime.currentHp),
    defenderHp: Math.max(0, defenderRuntime.currentHp),
  });

  return {
    rulesVersion: BATTLE_RULES_VERSION,
    seed,
    rounds: finalRound,
    winnerSide: winner.side,
    loserSide: loser.side,
    attackerSnapshot: attackerRuntime.snapshot,
    defenderSnapshot: defenderRuntime.snapshot,
    events,
    xp: resultXp,
  };
}

function createRuntimeFighter(
  side: FighterSide,
  loadout: CharacterLoadout,
): RuntimeFighter {
  const finalStats = applyLoadoutBonuses(
    loadout.baseStats,
    loadout.deck,
    loadout.talisman,
  );
  const snapshot: BattleParticipantSnapshot = {
    characterId: loadout.id,
    ownerUserId: loadout.ownerUserId,
    emoji: loadout.emoji,
    name: loadout.name,
    level: loadout.level,
    power: calculatePower(loadout),
    baseStats: loadout.baseStats,
    finalStats,
    cards: loadout.deck.map((card) => ({
      id: card.id,
      name: card.name,
      emoji: card.emoji,
      rarity: card.rarity,
    })),
  };

  return {
    side,
    loadout,
    snapshot,
    currentHp: finalStats.hp,
    lowHpHealUsed: false,
    openingBarrierUsed: false,
  };
}

function getTurnOrder(
  attacker: RuntimeFighter,
  defender: RuntimeFighter,
  round: number,
): [RuntimeFighter, RuntimeFighter] {
  if (attacker.snapshot.finalStats.speed === defender.snapshot.finalStats.speed) {
    return round % 2 === 1 ? [attacker, defender] : [defender, attacker];
  }

  return attacker.snapshot.finalStats.speed > defender.snapshot.finalStats.speed
    ? [attacker, defender]
    : [defender, attacker];
}

function sumAffixValues(affixes: CardAffix[]) {
  return affixes.reduce((total, affix) => total + affix.value, 0);
}

function getActorAttack(actor: RuntimeFighter) {
  let attack = actor.snapshot.finalStats.attack;
  const frenzyAffixes = actor.loadout.deck.flatMap((card) =>
    getCombatAffixes(card).filter((affix) => affix.effectType === "battle_frenzy_attack"),
  );

  if (actor.currentHp <= actor.snapshot.finalStats.hp * 0.5) {
    attack += sumAffixValues(frenzyAffixes);
  }

  return attack;
}

function calculateMitigatedDamage({
  actor,
  target,
  random,
}: {
  actor: RuntimeFighter;
  target: RuntimeFighter;
  random: () => number;
}) {
  const actorStats = actor.snapshot.finalStats;
  const targetStats = target.snapshot.finalStats;
  const variance = 0.9 + random() * 0.2;
  const critical = random() < actorStats.critChance;
  const rawDamage = getActorAttack(actor) * variance * (critical ? 1.6 : 1);
  let mitigatedDamage = Math.max(1, Math.round(rawDamage - targetStats.defense * 0.65));

  if (!target.openingBarrierUsed) {
    const barrierAffixes = target.loadout.deck.flatMap((card) =>
      getCombatAffixes(card).filter((affix) => affix.effectType === "opening_barrier"),
    );
    const reduction = Math.min(0.8, sumAffixValues(barrierAffixes));

    if (reduction > 0) {
      mitigatedDamage = Math.max(1, Math.round(mitigatedDamage * (1 - reduction)));
      target.openingBarrierUsed = true;
    }
  }

  return { mitigatedDamage, critical };
}

function applyPostHitEffects({
  actor,
  target,
  round,
  damage,
  events,
}: {
  actor: RuntimeFighter;
  target: RuntimeFighter;
  round: number;
  damage: number;
  events: BattleEvent[];
}) {
  const lifestealAffixes = actor.loadout.deck.flatMap((card) =>
    getCombatAffixes(card).filter((affix) => affix.effectType === "vampiric_lifesteal"),
  );
  const lifestealRate = Math.min(0.75, sumAffixValues(lifestealAffixes));

  if (lifestealRate > 0) {
    const healAmount = Math.max(1, Math.round(damage * lifestealRate));
    actor.currentHp = Math.min(
      actor.snapshot.finalStats.hp,
      actor.currentHp + healAmount,
    );
    events.push({
      type: "card_effect",
      round,
      actor: actor.side,
      cardId: `${actor.side}-lifesteal`,
      cardName: "Lebensraub",
      effectType: "vampiric_lifesteal",
      value: healAmount,
      actorHpAfter: actor.currentHp,
    });
  }

  const thornsAffixes = target.loadout.deck.flatMap((card) =>
    getCombatAffixes(card).filter((affix) => affix.effectType === "thorns_reflect"),
  );
  const thornsRate = Math.min(0.75, sumAffixValues(thornsAffixes));

  if (thornsRate > 0) {
    const reflectDamage = Math.max(1, Math.round(damage * thornsRate));
    actor.currentHp = Math.max(0, actor.currentHp - reflectDamage);
    events.push({
      type: "card_effect",
      round,
      actor: target.side,
      target: actor.side,
      cardId: `${target.side}-thorns`,
      cardName: "Dornen",
      effectType: "thorns_reflect",
      value: reflectDamage,
      targetHpAfter: actor.currentHp,
    });
  }
}

function performAttack({
  actor,
  target,
  round,
  random,
}: {
  actor: RuntimeFighter;
  target: RuntimeFighter;
  round: number;
  random: () => number;
}) {
  const events: BattleEvent[] = [];
  const { mitigatedDamage, critical } = calculateMitigatedDamage({
    actor,
    target,
    random,
  });

  target.currentHp = Math.max(0, target.currentHp - mitigatedDamage);
  events.push({
    type: "attack",
    round,
    actor: actor.side,
    target: target.side,
    damage: mitigatedDamage,
    critical,
    targetHpAfter: target.currentHp,
  });
  applyPostHitEffects({
    actor,
    target,
    round,
    damage: mitigatedDamage,
    events,
  });

  const doubleStrikeAffixes = actor.loadout.deck.flatMap((card) =>
    getCombatAffixes(card).filter((affix) => affix.effectType === "double_strike_chance"),
  );
  const doubleStrikeChance = Math.min(0.6, sumAffixValues(doubleStrikeAffixes));

  if (target.currentHp > 0 && random() < doubleStrikeChance) {
    const followUp = calculateMitigatedDamage({ actor, target, random });
    target.currentHp = Math.max(0, target.currentHp - followUp.mitigatedDamage);
    events.push({
      type: "attack",
      round,
      actor: actor.side,
      target: target.side,
      damage: followUp.mitigatedDamage,
      critical: followUp.critical,
      targetHpAfter: target.currentHp,
    });
    applyPostHitEffects({
      actor,
      target,
      round,
      damage: followUp.mitigatedDamage,
      events,
    });
  }

  return events;
}

function applyFirstStrike({
  actor,
  target,
  round,
  events,
}: {
  actor: RuntimeFighter;
  target: RuntimeFighter;
  round: number;
  events: BattleEvent[];
}) {
  if (round !== 1) {
    return;
  }

  for (const card of actor.loadout.deck) {
    for (const affix of getCombatAffixes(card).filter(
      (entry) => entry.effectType === "first_strike_damage",
    )) {
      const damage = Math.max(
        1,
        Math.round(affix.value - target.snapshot.finalStats.defense * 0.25),
      );
      target.currentHp = Math.max(0, target.currentHp - damage);
      events.push(
        toCardDamageEvent({
          actor,
          target,
          card,
          affix,
          round,
          damage,
        }),
      );
    }
  }
}

function applyLowHpHeal({
  fighter,
  round,
  events,
}: {
  fighter: RuntimeFighter;
  round: number;
  events: BattleEvent[];
}) {
  if (fighter.lowHpHealUsed || fighter.currentHp <= 0) {
    return;
  }

  const lowHpThreshold = fighter.snapshot.finalStats.hp * 0.35;
  let bestHeal:
    | { card: CardDefinition; affix: CardAffix; value: number }
    | null = null;

  for (const card of fighter.loadout.deck) {
    for (const affix of getCombatAffixes(card).filter(
      (entry) => entry.effectType === "low_hp_heal",
    )) {
      if (!bestHeal || affix.value > bestHeal.value) {
        bestHeal = { card, affix, value: affix.value };
      }
    }
  }

  if (!bestHeal || fighter.currentHp > lowHpThreshold) {
    return;
  }

  fighter.lowHpHealUsed = true;
  fighter.currentHp = Math.min(
    fighter.snapshot.finalStats.hp,
    fighter.currentHp + bestHeal.value,
  );
  events.push({
    type: "card_effect",
    round,
    actor: fighter.side,
    cardId: bestHeal.card.id,
    cardName: bestHeal.card.name,
    effectType: bestHeal.affix.effectType,
    value: bestHeal.value,
    actorHpAfter: fighter.currentHp,
  });
}

function toCardDamageEvent({
  actor,
  target,
  card,
  affix,
  round,
  damage,
}: {
  actor: RuntimeFighter;
  target: RuntimeFighter;
  card: CardDefinition;
  affix: CardAffix;
  round: number;
  damage: number;
}): BattleEvent {
  return {
    type: "card_effect",
    round,
    actor: actor.side,
    target: target.side,
    cardId: card.id,
    cardName: card.name,
    effectType: affix.effectType,
    value: damage,
    targetHpAfter: target.currentHp,
  };
}

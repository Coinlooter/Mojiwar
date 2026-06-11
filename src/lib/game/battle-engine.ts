import { applyLoadoutBonuses, calculatePower } from "./calculate-power";
import { calculateBattleXp } from "./leveling";
import { createSeededRandom } from "./random";
import type {
  BattleEvent,
  BattleParticipantSnapshot,
  BattleResult,
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

      const attackEvent = performAttack({
        actor,
        target,
        round,
        random,
      });
      events.push(attackEvent);

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
  const actorStats = actor.snapshot.finalStats;
  const targetStats = target.snapshot.finalStats;
  const variance = 0.9 + random() * 0.2;
  const critical = random() < actorStats.critChance;
  const rawDamage = actorStats.attack * variance * (critical ? 1.6 : 1);
  const mitigatedDamage = Math.max(1, Math.round(rawDamage - targetStats.defense * 0.65));

  target.currentHp = Math.max(0, target.currentHp - mitigatedDamage);

  return {
    type: "attack" as const,
    round,
    actor: actor.side,
    target: target.side,
    damage: mitigatedDamage,
    critical,
    targetHpAfter: target.currentHp,
  };
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
    if (card.effectType !== "first_strike_damage") {
      continue;
    }

    const damage = Math.max(1, Math.round(card.effectValue - target.snapshot.finalStats.defense * 0.25));
    target.currentHp = Math.max(0, target.currentHp - damage);
    events.push(toCardDamageEvent({ actor, target, card, round, damage }));
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

  const healCard = fighter.loadout.deck.find((card) => card.effectType === "low_hp_heal");
  const lowHpThreshold = fighter.snapshot.finalStats.hp * 0.35;

  if (!healCard || fighter.currentHp > lowHpThreshold) {
    return;
  }

  fighter.lowHpHealUsed = true;
  fighter.currentHp = Math.min(
    fighter.snapshot.finalStats.hp,
    fighter.currentHp + healCard.effectValue,
  );
  events.push({
    type: "card_effect",
    round,
    actor: fighter.side,
    cardId: healCard.id,
    cardName: healCard.name,
    effectType: healCard.effectType,
    value: healCard.effectValue,
    actorHpAfter: fighter.currentHp,
  });
}

function toCardDamageEvent({
  actor,
  target,
  card,
  round,
  damage,
}: {
  actor: RuntimeFighter;
  target: RuntimeFighter;
  card: CardDefinition;
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
    effectType: card.effectType,
    value: damage,
    targetHpAfter: target.currentHp,
  };
}

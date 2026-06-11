import { z } from "zod";

import { STARTER_EMOJIS } from "@/constants/starter-emojis";
import type { BattleResult } from "./types";

const cardRaritySchema = z.enum(["common", "rare", "epic"]);
const cardEffectTypeSchema = z.enum([
  "bonus_hp",
  "bonus_attack",
  "bonus_defense",
  "bonus_speed",
  "bonus_crit_chance",
  "first_strike_damage",
  "low_hp_heal",
]);
const fighterSideSchema = z.enum(["attacker", "defender"]);

const combatStatsSchema = z.object({
  hp: z.number(),
  attack: z.number(),
  defense: z.number(),
  speed: z.number(),
  critChance: z.number(),
});

const battleParticipantSnapshotSchema = z.object({
  characterId: z.string().uuid(),
  ownerUserId: z.string().uuid(),
  emoji: z.string(),
  name: z.string(),
  level: z.number(),
  power: z.number(),
  baseStats: combatStatsSchema,
  finalStats: combatStatsSchema,
  cards: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      emoji: z.string(),
      rarity: cardRaritySchema,
    }),
  ),
});

const battleEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("battle_started"),
    round: z.literal(0),
    attacker: battleParticipantSnapshotSchema,
    defender: battleParticipantSnapshotSchema,
  }),
  z.object({
    type: z.literal("attack"),
    round: z.number(),
    actor: fighterSideSchema,
    target: fighterSideSchema,
    damage: z.number(),
    critical: z.boolean(),
    targetHpAfter: z.number(),
  }),
  z.object({
    type: z.literal("card_effect"),
    round: z.number(),
    actor: fighterSideSchema,
    target: fighterSideSchema.optional(),
    cardId: z.string(),
    cardName: z.string(),
    effectType: cardEffectTypeSchema,
    value: z.number(),
    targetHpAfter: z.number().optional(),
    actorHpAfter: z.number().optional(),
  }),
  z.object({
    type: z.literal("fighter_defeated"),
    round: z.number(),
    loser: fighterSideSchema,
    winner: fighterSideSchema,
  }),
  z.object({
    type: z.literal("battle_finished"),
    round: z.number(),
    winner: fighterSideSchema,
    loser: fighterSideSchema,
    attackerHp: z.number(),
    defenderHp: z.number(),
  }),
]);

export const battleResultSchema = z.object({
  rulesVersion: z.number(),
  seed: z.string(),
  rounds: z.number(),
  winnerSide: fighterSideSchema,
  loserSide: fighterSideSchema,
  attackerSnapshot: battleParticipantSnapshotSchema,
  defenderSnapshot: battleParticipantSnapshotSchema,
  events: z.array(battleEventSchema),
  xp: z.object({
    attacker: z.number(),
    defender: z.number(),
  }),
  gold: z
    .object({
      attacker: z.number(),
      defender: z.number(),
    })
    .optional(),
});

export function parseBattleResult(value: unknown): BattleResult {
  return battleResultSchema.parse(value);
}

export const createCharacterSchema = z.object({
  emoji: z.enum(STARTER_EMOJIS),
  name: z.string().trim().min(2).max(32),
});

export const challengeCharacterSchema = z.object({
  defenderCharacterId: z.string().uuid(),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type ChallengeCharacterInput = z.infer<typeof challengeCharacterSchema>;

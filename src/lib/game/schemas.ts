import { z } from "zod";

export const createCharacterSchema = z.object({
  emoji: z.string().trim().min(1).max(16),
  name: z.string().trim().min(2).max(32),
});

export const challengeCharacterSchema = z.object({
  defenderCharacterId: z.string().uuid(),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type ChallengeCharacterInput = z.infer<typeof challengeCharacterSchema>;

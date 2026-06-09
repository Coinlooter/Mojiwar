import { z } from "zod";

import { STARTER_EMOJIS } from "@/constants/starter-emojis";

export const createCharacterSchema = z.object({
  emoji: z.enum(STARTER_EMOJIS),
  name: z.string().trim().min(2).max(32),
});

export const challengeCharacterSchema = z.object({
  defenderCharacterId: z.string().uuid(),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type ChallengeCharacterInput = z.infer<typeof challengeCharacterSchema>;

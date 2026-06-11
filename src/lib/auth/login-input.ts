import { z } from "zod";

import { isInternalRecoveryEmail } from "@/lib/auth/account-email";
import {
  parseRecoveryCodeInput,
  type RecoveryCodeParts,
} from "@/lib/auth/recovery-code";

const emailSchema = z.email();

export type LoginInput =
  | { kind: "email"; email: string }
  | { kind: "recovery-code"; parts: RecoveryCodeParts };

export function parseLoginInput(value: string): LoginInput | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("@")) {
    const parsed = emailSchema.safeParse(trimmed);

    if (!parsed.success || isInternalRecoveryEmail(parsed.data)) {
      return null;
    }

    return { kind: "email", email: parsed.data };
  }

  const parts = parseRecoveryCodeInput(trimmed);

  if (!parts) {
    return null;
  }

  return { kind: "recovery-code", parts };
}

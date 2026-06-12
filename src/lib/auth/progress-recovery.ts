import { createHash, randomInt } from "node:crypto";

import {
  buildRecoveryCode,
  formatRecoveryCodeDisplay,
  type RecoveryCodeParts,
  validateRecoveryCodeParts,
} from "@/lib/auth/recovery-code";
import {
  RECOVERY_ANIMALS,
  RECOVERY_COLORS,
} from "@/lib/auth/recovery-words";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_ASSIGN_ATTEMPTS = 64;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;

export type RecoveryCodeRecord = RecoveryCodeParts & {
  createdAt: string;
};

function hashIpAddress(ipAddress: string) {
  return createHash("sha256").update(ipAddress).digest("hex");
}

function randomRecoveryParts(): RecoveryCodeParts {
  const colorSlug =
    RECOVERY_COLORS[randomInt(RECOVERY_COLORS.length)]?.slug ?? "blauer";
  const animalSlug =
    RECOVERY_ANIMALS[randomInt(RECOVERY_ANIMALS.length)]?.slug ?? "elefant";
  const numberSuffix = String(randomInt(100)).padStart(2, "0");

  return { colorSlug, animalSlug, numberSuffix };
}

export async function getRecoveryCodeForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("progress_recovery_codes")
    .select("color_slug, animal_slug, number_suffix, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    colorSlug: data.color_slug,
    animalSlug: data.animal_slug,
    numberSuffix: data.number_suffix,
    createdAt: data.created_at,
  } satisfies RecoveryCodeRecord;
}

async function persistRecoveryCodeForUser(
  userId: string,
  mode: "insert-if-absent" | "upsert",
) {
  const admin = createSupabaseServiceClient();

  for (let attempt = 0; attempt < MAX_ASSIGN_ATTEMPTS; attempt += 1) {
    const parts = randomRecoveryParts();

    if (!validateRecoveryCodeParts(parts)) {
      continue;
    }

    const row = {
      user_id: userId,
      color_slug: parts.colorSlug,
      animal_slug: parts.animalSlug,
      number_suffix: parts.numberSuffix,
    };

    if (mode === "upsert") {
      const { error } = await admin
        .from("progress_recovery_codes")
        .upsert(row, { onConflict: "user_id" });

      if (!error) {
        return formatRecoveryCodeDisplay(parts);
      }

      if (error.code !== "23505") {
        throw new Error("Speicher-Code konnte nicht erstellt werden.");
      }

      continue;
    }

    const { error } = await admin.from("progress_recovery_codes").insert(row);

    if (!error) {
      return formatRecoveryCodeDisplay(parts);
    }

    if (error.code === "23505") {
      const existing = await getRecoveryCodeForUser(userId);

      if (existing) {
        return formatRecoveryCodeDisplay(existing);
      }

      continue;
    }

    throw new Error("Speicher-Code konnte nicht erstellt werden.");
  }

  throw new Error("Kein freier Speicher-Code gefunden. Bitte versuche es erneut.");
}

export async function ensureRecoveryCodeForUser(userId: string) {
  const existing = await getRecoveryCodeForUser(userId);

  if (existing) {
    return formatRecoveryCodeDisplay(existing);
  }

  return persistRecoveryCodeForUser(userId, "insert-if-absent");
}

export async function assignRecoveryCodeForUser(userId: string) {
  return persistRecoveryCodeForUser(userId, "upsert");
}

export async function lookupUserIdByRecoveryCode(parts: RecoveryCodeParts) {
  if (!validateRecoveryCodeParts(parts)) {
    return null;
  }

  const admin = createSupabaseServiceClient();
  const { data, error } = await admin.rpc("lookup_progress_recovery_code", {
    p_color_slug: parts.colorSlug,
    p_animal_slug: parts.animalSlug,
    p_number_suffix: parts.numberSuffix,
  });

  if (error || !data) {
    return null;
  }

  return data;
}

export async function recordRecoveryAttempt(ipAddress: string) {
  const admin = createSupabaseServiceClient();

  await admin.from("progress_recovery_attempts").insert({
    ip_hash: hashIpAddress(ipAddress),
  });
}

export async function isRecoveryRateLimited(ipAddress: string) {
  const admin = createSupabaseServiceClient();
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const ipHash = hashIpAddress(ipAddress);

  const { count, error } = await admin
    .from("progress_recovery_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("attempted_at", since);

  if (error) {
    return false;
  }

  return (count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS;
}

export function getRecoveryCodeHint(parts: RecoveryCodeParts) {
  return buildRecoveryCode(parts);
}

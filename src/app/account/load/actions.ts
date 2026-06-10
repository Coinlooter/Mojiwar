"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  parseRecoveryCodeInput,
  validateRecoveryCodeParts,
  type RecoveryCodeParts,
} from "@/lib/auth/recovery-code";
import {
  isRecoveryRateLimited,
  lookupUserIdByRecoveryCode,
  recordRecoveryAttempt,
} from "@/lib/auth/progress-recovery";
import { establishSessionForUser } from "@/lib/auth/recovery-session";
import { getPrimaryCharacter } from "@/lib/auth/character";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getRecoveryPartsFromForm(formData: FormData): RecoveryCodeParts | null {
  const combined = formData.get("combined");

  if (typeof combined === "string" && combined.trim()) {
    const parsed = parseRecoveryCodeInput(combined);
    if (parsed) {
      return parsed;
    }
  }

  const colorSlug = formData.get("colorSlug");
  const animalSlug = formData.get("animalSlug");
  const numberSuffix = formData.get("numberSuffix");

  if (
    typeof colorSlug !== "string" ||
    typeof animalSlug !== "string" ||
    typeof numberSuffix !== "string"
  ) {
    return null;
  }

  const parts = {
    colorSlug: colorSlug.trim().toLowerCase(),
    animalSlug: animalSlug.trim().toLowerCase(),
    numberSuffix: numberSuffix.trim(),
  };

  return validateRecoveryCodeParts(parts) ? parts : null;
}

async function getClientIpAddress() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return headerStore.get("x-real-ip") ?? "unknown";
}

export async function loadProgressWithRecoveryCode(formData: FormData) {
  const ipAddress = await getClientIpAddress();

  if (await isRecoveryRateLimited(ipAddress)) {
    redirect("/account/load?error=rate-limit" as Route);
  }

  await recordRecoveryAttempt(ipAddress);

  const parts = getRecoveryPartsFromForm(formData);

  if (!parts) {
    redirect("/account/load?error=invalid-code" as Route);
  }

  const userId = await lookupUserIdByRecoveryCode(parts);

  if (!userId) {
    redirect("/account/load?error=not-found" as Route);
  }

  try {
    await establishSessionForUser(userId);
  } catch {
    redirect("/account/load?error=session" as Route);
  }

  const supabase = await createSupabaseServerClient();
  const character = await getPrimaryCharacter(supabase, userId);

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  if (character) {
    redirect("/dashboard?loaded=1" as Route);
  }

  redirect("/onboarding?loaded=1" as Route);
}

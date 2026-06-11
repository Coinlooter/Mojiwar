"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { mapEmailSecureError } from "@/lib/auth/email-secure";
import { parseLoginInput } from "@/lib/auth/login-input";
import {
  isRecoveryRateLimited,
  lookupUserIdByRecoveryCode,
  recordRecoveryAttempt,
} from "@/lib/auth/progress-recovery";
import { establishSessionForUser } from "@/lib/auth/recovery-session";
import { getPrimaryCharacter } from "@/lib/auth/character";
import { getAuthConfirmUrl } from "@/lib/auth/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getClientIpAddress() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return headerStore.get("x-real-ip") ?? "unknown";
}

export async function loginWithCredential(formData: FormData) {
  const ipAddress = await getClientIpAddress();

  if (await isRecoveryRateLimited(ipAddress)) {
    redirect("/login?error=rate-limit" as Route);
  }

  const credential = formData.get("credential");

  if (typeof credential !== "string") {
    redirect("/login?error=invalid-input" as Route);
  }

  const parsed = parseLoginInput(credential);

  if (!parsed) {
    redirect(
      (credential.includes("@")
        ? "/login?error=invalid-email"
        : "/login?error=invalid-code") as Route,
    );
  }

  if (parsed.kind === "email") {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: getAuthConfirmUrl("/dashboard"),
      },
    });

    if (error) {
      redirect(`/login?error=${mapEmailSecureError(error)}` as Route);
    }

    redirect("/login?login=email-sent" as Route);
  }

  await recordRecoveryAttempt(ipAddress);

  const userId = await lookupUserIdByRecoveryCode(parsed.parts);

  if (!userId) {
    redirect("/login?error=not-found" as Route);
  }

  try {
    await establishSessionForUser(userId);
  } catch {
    redirect("/login?error=session" as Route);
  }

  const supabase = await createSupabaseServerClient();
  const character = await getPrimaryCharacter(supabase, userId);

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  if (character) {
    redirect("/dashboard" as Route);
  }

  redirect("/onboarding" as Route);
}

/** @deprecated Verwende loginWithCredential */
export async function loginWithRecoveryCode(formData: FormData) {
  return loginWithCredential(formData);
}

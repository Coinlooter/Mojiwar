"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-character";
import { assignRecoveryCodeForUser } from "@/lib/auth/progress-recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.email();

export async function createRecoveryCode() {
  const { user } = await requireUser();

  if (!user.is_anonymous) {
    redirect("/account/secure?error=already-secured" as Route);
  }

  await assignRecoveryCodeForUser(user.id);

  revalidatePath("/account/secure");
  revalidatePath("/dashboard");
  redirect("/account/secure?created=1" as Route);
}

export async function regenerateRecoveryCode() {
  const { user } = await requireUser();

  if (!user.is_anonymous) {
    redirect("/account/secure?error=already-secured" as Route);
  }

  await assignRecoveryCodeForUser(user.id);

  revalidatePath("/account/secure");
  revalidatePath("/dashboard");
  redirect("/account/secure?regenerated=1" as Route);
}

export async function linkParentEmail(formData: FormData) {
  await requireUser();
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    redirect("/account/secure?error=invalid-email" as Route);
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser(
    {
      email: parsed.data,
    },
    {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/dashboard`,
    },
  );

  if (error) {
    redirect("/account/secure?error=email-failed" as Route);
  }

  revalidatePath("/account/secure");
  revalidatePath("/dashboard");
  redirect("/account/secure?email-sent=1" as Route);
}

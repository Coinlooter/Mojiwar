"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hasSecuredEmailAccount } from "@/lib/auth/account-email";
import { mapEmailSecureError } from "@/lib/auth/email-secure";
import { requireUser } from "@/lib/auth/require-character";
import { getAuthConfirmUrl } from "@/lib/auth/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.email();

export async function linkParentEmail(formData: FormData) {
  const { user } = await requireUser();
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    redirect("/dashboard?login-error=invalid-email" as Route);
  }

  if (hasSecuredEmailAccount({ isAnonymous: user.is_anonymous ?? false, email: user.email })) {
    redirect("/dashboard?login-error=already-secured" as Route);
  }

  const supabase = await createSupabaseServerClient();
  const emailRedirectTo = getAuthConfirmUrl("/dashboard");
  const normalizedEmail = parsed.data.trim().toLowerCase();

  if (user.new_email?.toLowerCase() === normalizedEmail) {
    const { error: resendError } = await supabase.auth.resend({
      type: "email_change",
      email: normalizedEmail,
      options: { emailRedirectTo },
    });

    if (resendError) {
      redirect(
        `/dashboard?login-error=${mapEmailSecureError(resendError)}` as Route,
      );
    }

    revalidatePath("/dashboard");
    redirect("/dashboard?login=email-sent" as Route);
  }

  const { error } = await supabase.auth.updateUser(
    { email: normalizedEmail },
    { emailRedirectTo },
  );

  if (error) {
    redirect(`/dashboard?login-error=${mapEmailSecureError(error)}` as Route);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?login=email-sent" as Route);
}

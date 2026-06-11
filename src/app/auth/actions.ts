"use server";

import { revalidatePath } from "next/cache";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getPrimaryCharacter } from "@/lib/auth/character";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BootstrapSessionState = {
  error: string | null;
};

export async function bootstrapPlayerSession(
  _prevState: BootstrapSessionState,
  _formData: FormData,
): Promise<BootstrapSessionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      return {
        error:
          "Das hat gerade nicht geklappt. Bitte versuche es gleich noch einmal.",
      };
    }
  }

  const {
    data: { user: verifiedUser },
  } = await supabase.auth.getUser();

  if (!verifiedUser) {
    return {
      error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    };
  }

  const character = await getPrimaryCharacter(supabase, verifiedUser.id);

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  if (character) {
    redirect("/dashboard" as Route);
  }

  redirect("/onboarding" as Route);
}

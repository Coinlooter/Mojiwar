import type { SupabaseClient } from "@supabase/supabase-js";

import { getPrimaryCharacter } from "@/lib/auth/character";
import type { Database } from "@/lib/supabase/database.types";

export async function resolvePostAuthPath(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedNext?: string | null,
) {
  const character = await getPrimaryCharacter(supabase, userId);

  if (character) {
    if (requestedNext?.startsWith("/") && requestedNext !== "/onboarding") {
      return requestedNext;
    }

    return "/dashboard";
  }

  return "/onboarding";
}

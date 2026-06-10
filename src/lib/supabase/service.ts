import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabaseBrowserEnv } from "./env";

export function createSupabaseServiceClient() {
  const { url } = getSupabaseBrowserEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

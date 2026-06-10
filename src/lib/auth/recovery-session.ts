import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function buildInternalRecoveryEmail(userId: string) {
  return `player+${userId.replace(/-/g, "")}@recovery.emojitsu.app`;
}

export async function ensureInternalRecoveryEmail(userId: string) {
  const admin = createSupabaseServiceClient();
  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    throw new Error("Spieler konnte nicht gefunden werden.");
  }

  if (userData.user.email) {
    return userData.user.email;
  }

  const recoveryEmail = buildInternalRecoveryEmail(userId);
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    email: recoveryEmail,
    email_confirm: true,
  });

  if (updateError) {
    throw new Error("Recovery-E-Mail konnte nicht vorbereitet werden.");
  }

  return recoveryEmail;
}

export async function establishSessionForUser(userId: string) {
  const email = await ensureInternalRecoveryEmail(userId);
  const admin = createSupabaseServiceClient();
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkError || !linkData.properties?.hashed_token) {
    throw new Error("Login-Link konnte nicht erstellt werden.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });

  if (verifyError || !sessionData.session) {
    throw new Error("Spieler-Session konnte nicht gestartet werden.");
  }

  return sessionData.session;
}

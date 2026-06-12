import type { Route } from "next";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { canRecoverAccountProgress } from "@/lib/auth/account-email";
import { getPrimaryCharacter } from "@/lib/auth/character";
import { getRecoveryCodeForUser } from "@/lib/auth/progress-recovery";
import { getVerifiedUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const { supabase, user } = await getVerifiedUser();
  const character = user
    ? await getPrimaryCharacter(supabase, user.id)
    : null;
  const isLoggedIn = Boolean(character);
  const recoveryCode = user ? await getRecoveryCodeForUser(user.id) : null;
  const canLogout =
    isLoggedIn &&
    user &&
    canRecoverAccountProgress({
      hasRecoveryCode: Boolean(recoveryCode),
      isAnonymous: user.is_anonymous ?? false,
      email: user.email,
    });

  return (
    <header className="site-header glass-chrome">
      <div className="site-chrome-inner">
        <Link
          className="brand"
          href={(isLoggedIn ? "/dashboard" : "/") as Route}
        >
          <span className="brand-mark" aria-hidden>
            ⚔️
          </span>
          <span className="brand-copy">
            <span className="brand-title">Emojitsu</span>
            <span className="brand-subtitle">Emoji-Kampfspiel</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Hauptnavigation">
          {canLogout ? (
            <LogoutButton compact />
          ) : !isLoggedIn ? (
            <Link className="button button-compact primary" href={"/login" as Route}>
              Spielen
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

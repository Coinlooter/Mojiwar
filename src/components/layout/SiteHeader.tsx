import type { Route } from "next";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { getPrimaryCharacter } from "@/lib/auth/character";
import { getVerifiedUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const { supabase, user } = await getVerifiedUser();
  const character = user
    ? await getPrimaryCharacter(supabase, user.id)
    : null;
  const isLoggedIn = Boolean(character);

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
          {isLoggedIn ? (
            <LogoutButton compact />
          ) : (
            <Link className="button button-compact primary" href={"/login" as Route}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

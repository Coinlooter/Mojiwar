import type { Route } from "next";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { getVerifiedUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const { user } = await getVerifiedUser();

  return (
    <header className="site-header glass-chrome">
      <div className="site-chrome-inner">
        <Link
          className="brand"
          href={(user ? "/dashboard" : "/") as Route}
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
          {user ? (
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

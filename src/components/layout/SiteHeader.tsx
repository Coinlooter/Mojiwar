import type { Route } from "next";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { getVerifiedUser } from "@/lib/auth/session";

const guestNavItems = [
  { href: "/login", label: "Login" },
  { href: "/leaderboard", label: "Rangliste" },
] as const;

export async function SiteHeader() {
  const { user } = await getVerifiedUser();

  return (
    <header className="site-header glass-chrome">
      <div className="site-chrome-inner">
        <Link className="brand" href={user ? "/dashboard" : "/"}>
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
            <div className="nav-links">
              {guestNavItems.map((item) => (
                <Link
                  className={`button button-compact${item.href === "/login" ? " primary" : ""}`}
                  href={item.href as Route}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

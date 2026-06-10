import type { Route } from "next";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { getVerifiedUser } from "@/lib/auth/session";

const guestNavItems = [
  { href: "/login", label: "Login" },
  { href: "/leaderboard", label: "Rangliste" },
] as const;

const memberNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/opponents", label: "Kampf" },
  { href: "/deck", label: "Inventar" },
  { href: "/leaderboard", label: "Rangliste" },
] as const;

export async function SiteHeader() {
  const { user } = await getVerifiedUser();
  const navItems = user ? memberNavItems : guestNavItems;

  return (
    <header className="site-header glass-chrome">
      <div className="site-chrome-inner">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            ⚔️
          </span>
          <span className="brand-copy">
            <span className="brand-title">Emojitsu</span>
            <span className="brand-subtitle">Emoji-Kampfspiel</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Hauptnavigation">
          <div className="nav-links">
            {navItems.map((item) => {
              const isPrimary =
                (!user && item.href === "/login") ||
                (user && item.href === "/opponents");

              return (
                <Link
                  className={`button button-compact${isPrimary ? " primary" : ""}`}
                  href={item.href as Route}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {user ? <LogoutButton compact /> : null}
        </nav>
      </div>
    </header>
  );
}

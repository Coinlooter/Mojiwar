import type { Route } from "next";
import Link from "next/link";

import { StartPlayingButton } from "@/components/auth/StartPlayingButton";

const navItems = [
  { href: "/dashboard", label: "Mein Spiel" },
  { href: "/opponents", label: "Gegner" },
  { href: "/deck", label: "Inventar" },
  { href: "/leaderboard", label: "Rangliste" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header glass-chrome">
      <div className="site-chrome-inner">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            ⚔️
          </span>
          <span className="brand-copy">
            <span className="brand-title">Mojiwar</span>
            <span className="brand-subtitle">Emoji-Kampfspiel</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Hauptnavigation">
          <div className="nav-links">
            {navItems.map((item) => (
              <Link href={item.href as Route} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <StartPlayingButton>Jetzt spielen</StartPlayingButton>
        </nav>
      </div>
    </header>
  );
}

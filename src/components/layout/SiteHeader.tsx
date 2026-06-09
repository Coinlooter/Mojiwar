import Link from "next/link";

import { StartPlayingButton } from "@/components/auth/StartPlayingButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/opponents", label: "Gegner" },
  { href: "/deck", label: "Deck" },
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
            <span className="brand-subtitle">Async Emoji Auto-Battler</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Hauptnavigation">
          <div className="nav-links">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <StartPlayingButton>Sofort spielen</StartPlayingButton>
        </nav>
      </div>
    </header>
  );
}

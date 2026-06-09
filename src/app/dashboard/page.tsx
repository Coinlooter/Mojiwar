import Link from "next/link";

const inboxStats = [
  { label: "Neue Herausforderungen", value: "7" },
  { label: "Offline gewonnen", value: "3" },
  { label: "Offline verloren", value: "4" },
  { label: "Neue Karten", value: "2" },
];

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <nav className="nav" aria-label="Hauptnavigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            🏟️
          </span>
          <span>Mojiwar Dashboard</span>
        </Link>
        <div className="nav-links">
          <Link href="/opponents">Gegner suchen</Link>
          <Link href="/deck">Deck bearbeiten</Link>
        </div>
      </nav>

      <section>
        <p className="eyebrow">Offline-Inbox</p>
        <h1>Willkommen zurueck, Emoji-Coach.</h1>
        <p className="lead">
          Diese Ansicht wird spaeter aus gespeicherten Battles berechnet:
          Herausforderungen, Siege, Niederlagen, XP und erhaltene Karten.
        </p>
      </section>

      <section className="stat-grid" aria-label="Offline Statistiken">
        {inboxStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className="stat-value">{stat.value}</div>
            <p className="muted">{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="section feature-grid">
        <article className="feature-card">
          <h3>Aktives Emoji</h3>
          <div className="emoji">🦊</div>
          <p className="muted">Foxy · Level 4 · Power 298</p>
        </article>
        <article className="feature-card">
          <h3>Naechster Fokus</h3>
          <p className="muted">
            Drei aktive Karten ausbalancieren, dann Gegner in einer fairen
            Kampfkraft-Range herausfordern.
          </p>
        </article>
        <article className="feature-card">
          <h3>Reward-Schleife</h3>
          <p className="muted">
            Jeder Kampf gibt XP. Der Gewinner bekommt eine permanente Karte fuer
            kuenftige Deck-Strategien.
          </p>
        </article>
      </section>
    </main>
  );
}

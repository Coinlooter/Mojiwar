import Link from "next/link";

import { MAX_STARTER_DECK_SIZE, starterCards } from "@/lib/game/cards";

const activeCardIds = new Set(["ember-punch", "swift-sneaker", "panic-snack"]);

export default function DeckPage() {
  return (
    <main className="page-shell">
      <nav className="nav" aria-label="Hauptnavigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            🃏
          </span>
          <span>Deck</span>
        </Link>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/opponents">Gegner</Link>
        </div>
      </nav>

      <section>
        <p className="eyebrow">Meta-Strategie</p>
        <h1>{MAX_STARTER_DECK_SIZE} Karten entscheiden deinen Build.</h1>
        <p className="lead">
          Karten sind permanent. Anfangs passen maximal drei Karten in dein
          aktives Deck; spaeter koennen Level, Achievements oder Seasons neue
          Deck-Regeln freischalten.
        </p>
      </section>

      <section className="section feature-grid" aria-label="Kartensammlung">
        {starterCards.map((card) => {
          const active = activeCardIds.has(card.id);

          return (
            <article className="feature-card" key={card.id}>
              <div className="emoji">{card.emoji}</div>
              <p className="eyebrow">{card.rarity}</p>
              <h3>{card.name}</h3>
              <p className="muted">{card.description}</p>
              <p style={{ color: active ? "var(--success)" : "var(--muted)" }}>
                {active ? "Aktiv im Deck" : "In Sammlung"}
              </p>
            </article>
          );
        })}
      </section>
    </main>
  );
}

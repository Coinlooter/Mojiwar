import Link from "next/link";

import { StartPlayingButton } from "@/components/auth/StartPlayingButton";
import { simulateBattle } from "@/lib/game/battle-engine";
import { starterCards } from "@/lib/game/cards";

const demoBattle = simulateBattle({
  seed: "landing-demo",
  attacker: {
    id: "attacker",
    ownerUserId: "demo-a",
    emoji: "🦊",
    name: "Foxy",
    level: 4,
    xp: 280,
    baseStats: {
      hp: 110,
      attack: 19,
      defense: 7,
      speed: 13,
      critChance: 0.08,
    },
    deck: [starterCards[0], starterCards[3], starterCards[6]],
  },
  defender: {
    id: "defender",
    ownerUserId: "demo-b",
    emoji: "🐸",
    name: "Hopser",
    level: 3,
    xp: 190,
    baseStats: {
      hp: 126,
      attack: 16,
      defense: 9,
      speed: 9,
      critChance: 0.05,
    },
    deck: [starterCards[1], starterCards[2], starterCards[4]],
  },
});

export default function Home() {
  const winner =
    demoBattle.winnerSide === "attacker"
      ? demoBattle.attackerSnapshot
      : demoBattle.defenderSnapshot;

  return (
    <main className="page-shell">
      <nav className="nav" aria-label="Hauptnavigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            ⚔️
          </span>
          <span>Mojiwar</span>
        </Link>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/opponents">Gegner</Link>
          <Link href="/deck">Deck</Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">Async Emoji Auto-Battler</p>
          <h1>Baue dein Emoji. Gewinne Karten. Schlafe, waehrend du kaempfst.</h1>
          <p className="lead">
            Mojiwar ist ein asynchrones Multiplayer-RPG: Du forderst gezielt
            Gegner heraus oder findest automatisch passende Matches in deiner
            Kampfkraft-Range. Der Kampf wird fair serverseitig simuliert und als
            ueberspringbares Replay abgespielt.
          </p>
          <div className="actions">
            <StartPlayingButton />
            <Link className="button" href="/battle/demo">
              Demo-Kampf
            </Link>
          </div>
        </div>

        <aside className="panel battle-card" aria-label="Demo Kampf Ergebnis">
          <p className="eyebrow">Letzter Kampf</p>
          <div className="fighter-row">
            <div className="fighter">
              <div className="emoji">{demoBattle.attackerSnapshot.emoji}</div>
              <h3>{demoBattle.attackerSnapshot.name}</h3>
              <p className="muted">
                Power {demoBattle.attackerSnapshot.power} · Level{" "}
                {demoBattle.attackerSnapshot.level}
              </p>
            </div>
            <strong>VS</strong>
            <div className="fighter">
              <div className="emoji">{demoBattle.defenderSnapshot.emoji}</div>
              <h3>{demoBattle.defenderSnapshot.name}</h3>
              <p className="muted">
                Power {demoBattle.defenderSnapshot.power} · Level{" "}
                {demoBattle.defenderSnapshot.level}
              </p>
            </div>
          </div>
          <p style={{ marginTop: 22, marginBottom: 0 }}>
            Gewinner: <strong>{winner.emoji} {winner.name}</strong> nach{" "}
            {demoBattle.rounds} Runden
          </p>
        </aside>
      </section>

      <section className="stat-grid" aria-label="MVP Kennzahlen">
        <div className="stat-card">
          <div className="stat-value">3</div>
          <p className="muted">Start-Deck Slots</p>
        </div>
        <div className="stat-card">
          <div className="stat-value">±15%</div>
          <p className="muted">Auto-Matchmaking Range</p>
        </div>
        <div className="stat-card">
          <div className="stat-value">100%</div>
          <p className="muted">Serverseitige Kampfentscheidung</p>
        </div>
        <div className="stat-card">
          <div className="stat-value">1</div>
          <p className="muted">Permanente Karte fuer Gewinner</p>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Architektur</p>
        <h2>So bleibt das Spiel erweiterbar.</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Pure Battle Engine</h3>
            <p className="muted">
              Kampfregeln sind von React und Supabase getrennt und koennen
              isoliert getestet werden.
            </p>
          </article>
          <article className="feature-card">
            <h3>Battle-Logs als Replay</h3>
            <p className="muted">
              Die UI animiert gespeicherte Events. Alte Kaempfe bleiben auch
              nach spaeteren Regelversionen nachvollziehbar.
            </p>
          </article>
          <article className="feature-card">
            <h3>Supabase mit RLS</h3>
            <p className="muted">
              Client-Aktionen starten nur Herausforderungen. Ergebnis, XP und
              Kartenrewards entstehen serverseitig.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

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

const highlights = [
  {
    value: "3",
    label: "Start-Deck Slots",
  },
  {
    value: "±15%",
    label: "Auto-Matchmaking Range",
  },
  {
    value: "100%",
    label: "Serverseitige Kampfentscheidung",
  },
  {
    value: "1",
    label: "Permanente Karte fuer Gewinner",
  },
] as const;

const features = [
  {
    title: "Pure Battle Engine",
    description:
      "Kampfregeln sind von React und Supabase getrennt und koennen isoliert getestet werden.",
  },
  {
    title: "Battle-Logs als Replay",
    description:
      "Die UI animiert gespeicherte Events. Alte Kaempfe bleiben auch nach spaeteren Regelversionen nachvollziehbar.",
  },
  {
    title: "Supabase mit RLS",
    description:
      "Client-Aktionen starten nur Herausforderungen. Ergebnis, XP und Kartenrewards entstehen serverseitig.",
  },
] as const;

export default function Home() {
  const winner =
    demoBattle.winnerSide === "attacker"
      ? demoBattle.attackerSnapshot
      : demoBattle.defenderSnapshot;

  return (
    <>
      <section className="hero landing-hero">
        <div className="hero-copy">
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

        <aside className="panel battle-card landing-battle-card" aria-label="Demo Kampf Ergebnis">
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
          <p className="battle-result">
            Gewinner: <strong>{winner.emoji} {winner.name}</strong> nach{" "}
            {demoBattle.rounds} Runden
          </p>
        </aside>
      </section>

      <section className="stat-grid" aria-label="MVP Kennzahlen">
        {highlights.map((item) => (
          <div className="stat-card" key={item.label}>
            <div className="stat-value">{item.value}</div>
            <p className="muted">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="section">
        <p className="eyebrow">Architektur</p>
        <h2>So bleibt das Spiel erweiterbar.</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p className="muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

import Link from "next/link";

import { findBestAutomaticOpponent } from "@/lib/game/matchmaking";
import { starterCards } from "@/lib/game/cards";

const player = {
  id: "player",
  ownerUserId: "demo-player",
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
};

const candidates = [
  {
    id: "frog",
    ownerUserId: "demo-frog",
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
  {
    id: "ghost",
    ownerUserId: "demo-ghost",
    emoji: "👻",
    name: "Spuki",
    level: 6,
    xp: 530,
    baseStats: {
      hp: 132,
      attack: 24,
      defense: 8,
      speed: 15,
      critChance: 0.1,
    },
    deck: [starterCards[0], starterCards[4], starterCards[5]],
  },
  {
    id: "robot",
    ownerUserId: "demo-robot",
    emoji: "🤖",
    name: "Bitbot",
    level: 4,
    xp: 260,
    baseStats: {
      hp: 118,
      attack: 17,
      defense: 10,
      speed: 8,
      critChance: 0.05,
    },
    deck: [starterCards[1], starterCards[2], starterCards[3]],
  },
];

export default function OpponentsPage() {
  const match = findBestAutomaticOpponent({ player, candidates });

  return (
    <>
      <section>
        <p className="eyebrow">Matchmaking</p>
        <h1>Gezielt herausfordern oder automatisch matchen.</h1>
        <p className="lead">
          Auto-Matchmaking startet bei ±15% Kampfkraft und erweitert die Range,
          wenn kein fairer Gegner gefunden wird.
        </p>
      </section>

      {match ? (
        <section className="section panel battle-card">
          <p className="eyebrow">Bester Auto-Match</p>
          <h2>
            {match.opponent.emoji} {match.opponent.name}
          </h2>
          <p className="muted">
            Gegner-Power {match.opponentPower} · Range{" "}
            {Math.round(match.tolerance * 100)}%
          </p>
          <Link className="button primary" href="/battle/demo">
            Demo-Herausforderung starten
          </Link>
        </section>
      ) : null}

      <section className="section feature-grid" aria-label="Gegnerliste">
        {candidates.map((candidate) => (
          <article className="feature-card" key={candidate.id}>
            <div className="emoji">{candidate.emoji}</div>
            <h3>{candidate.name}</h3>
            <p className="muted">
              Level {candidate.level} · {candidate.deck.length} Karten aktiv
            </p>
          </article>
        ))}
      </section>
    </>
  );
}

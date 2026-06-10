import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { StartPlayingButton } from "@/components/auth/StartPlayingButton";
import { getVerifiedUser } from "@/lib/auth/session";
import { GameCard } from "@/components/cards/GameCard";
import { landingDemoBattle } from "@/constants/landing-demo";
import { starterCards } from "@/lib/game/cards";

const demoBattle = landingDemoBattle;

const heroEmojis = ["🦊", "🐸", "👻", "🤖", "🐉", "🦄"] as const;

const playSteps = [
  {
    emoji: "🎨",
    title: "Waehle dein Emoji",
    description: "Gib ihm einen coolen Namen. Das ist dein Held im Spiel.",
  },
  {
    emoji: "⚔️",
    title: "Fordere Gegner heraus",
    description: "Dein Emoji kaempft automatisch. Du musst nicht die ganze Zeit online sein.",
  },
  {
    emoji: "🃏",
    title: "Sammle Karten",
    description: "Wenn du gewinnst, bekommst du neue Karten fuer dein Deck.",
  },
] as const;

export const dynamic = "force-dynamic";

export default async function Home() {
  const { user } = await getVerifiedUser();

  if (user) {
    redirect("/dashboard" as Route);
  }

  const winner =
    demoBattle.winnerSide === "attacker"
      ? demoBattle.attackerSnapshot
      : demoBattle.defenderSnapshot;

  return (
    <div className="landing-page">
      <section className="hero landing-hero">
        <div className="hero-copy">
          <div className="landing-emoji-strip" aria-hidden>
            {heroEmojis.map((emoji) => (
              <span className="landing-emoji-chip" key={emoji}>
                {emoji}
              </span>
            ))}
          </div>

          <p className="eyebrow">Dein Emoji-Kampfspiel</p>
          <h1>Baue deinen Helden. Kaempfe. Gewinne Karten.</h1>
          <p className="lead">
            In Emojitsu erstellst du dein eigenes Emoji und schickst es in
            spannende Kaempfe. Gegner muessen nicht gleichzeitig online sein —
            dein Held kaempft auch, wenn du gerade etwas anderes machst.
          </p>
          <div className="actions">
            <Link className="button primary" href={"/login" as Route}>
              Login
            </Link>
            <StartPlayingButton>Neu spielen</StartPlayingButton>
            <Link className="button" href="/battle/demo">
              Kampf ansehen
            </Link>
          </div>
        </div>

        <aside
          className="panel battle-card landing-battle-card landing-arena"
          aria-label="Beispielkampf"
        >
          <p className="landing-arena-badge">Live im Kampf!</p>
          <div className="fighter-row">
            <div className="fighter landing-fighter">
              <div className="emoji">{demoBattle.attackerSnapshot.emoji}</div>
              <h3>{demoBattle.attackerSnapshot.name}</h3>
              <p className="muted">Level {demoBattle.attackerSnapshot.level}</p>
            </div>
            <span className="landing-vs">VS</span>
            <div className="fighter landing-fighter">
              <div className="emoji">{demoBattle.defenderSnapshot.emoji}</div>
              <h3>{demoBattle.defenderSnapshot.name}</h3>
              <p className="muted">Level {demoBattle.defenderSnapshot.level}</p>
            </div>
          </div>
          <p className="battle-result landing-winner">
            <span className="landing-trophy" aria-hidden>
              🏆
            </span>
            <strong>
              {winner.emoji} {winner.name}
            </strong>{" "}
            hat gewonnen!
          </p>
        </aside>
      </section>

      <section className="section landing-steps" aria-label="So spielst du">
        <p className="eyebrow">So spielst du</p>
        <h2>In drei Schritten geht es los.</h2>
        <div className="landing-step-grid">
          {playSteps.map((step, index) => (
            <article className="landing-step-card" key={step.title}>
              <span className="landing-step-number">{index + 1}</span>
              <div className="landing-step-emoji" aria-hidden>
                {step.emoji}
              </div>
              <h3>{step.title}</h3>
              <p className="muted">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section landing-cards" aria-label="Karten sammeln">
        <p className="eyebrow">Karten sammeln</p>
        <h2>Staerkere Emojis brauchen starke Karten.</h2>
        <p className="lead landing-cards-lead">
          Jede Karte gibt deinem Emoji neue Kraefte. Baue dein Lieblingsdeck
          und werde zum Champion.
        </p>
        <div className="landing-card-showcase">
          {starterCards.map((card) => (
            <GameCard
              emoji={card.emoji}
              key={card.id}
              name={card.name}
              rarity={card.rarity}
              size="sm"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

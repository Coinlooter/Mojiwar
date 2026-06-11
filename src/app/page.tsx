import type { Route } from "next";
import { redirect } from "next/navigation";

import { getVerifiedUser } from "@/lib/auth/session";
import { GameCard } from "@/components/cards/GameCard";
import { landingDemoBattle } from "@/constants/landing-demo";
import { starterCards } from "@/lib/game/cards";

const demoBattle = landingDemoBattle;

const heroEmojis = ["🦊", "🐸", "👻", "🦄"] as const;

const playSteps = [
  {
    emoji: "🎨",
    title: "Emoji wählen",
    description: "Held benennen — fertig.",
  },
  {
    emoji: "⚔️",
    title: "Kämpfen",
    description: "Runden laufen automatisch, auch offline.",
  },
  {
    emoji: "🃏",
    title: "Sammeln",
    description: "Gewonnene Karten ins Deck legen.",
  },
] as const;

const showcaseCardIds = ["ember-punch", "lucky-star", "panic-snack"] as const;

const showcaseCards = showcaseCardIds.flatMap((cardId) => {
  const card = starterCards.find((entry) => entry.id === cardId);

  return card ? [card] : [];
});

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
      <section className="panel battle-card landing-shell" aria-label="Emojitsu">
        <div className="landing-hero-compact">
          <div className="landing-intro">
            <div className="landing-title-block">
              <p className="eyebrow">Emoji-Kampfspiel</p>
              <h1>Dein Emoji. Dein Kampf.</h1>
              <p className="landing-tagline muted">
                Erstelle einen Helden, fordere Gegner heraus und sammle Karten —
                ohne dass beide gleichzeitig online sein müssen.
              </p>
            </div>

            <div className="landing-emoji-orbit" aria-hidden>
              {heroEmojis.map((emoji) => (
                <span className="landing-emoji-chip" key={emoji}>
                  {emoji}
                </span>
              ))}
            </div>
          </div>

          <aside className="landing-arena" aria-label="Beispielkampf">
            <p className="landing-arena-badge">Beispielkampf</p>
            <div className="fighter-row landing-fighter-row">
              <div className="fighter landing-fighter">
                <div className="emoji">{demoBattle.attackerSnapshot.emoji}</div>
                <h3>{demoBattle.attackerSnapshot.name}</h3>
                <p className="muted">Lvl {demoBattle.attackerSnapshot.level}</p>
              </div>
              <span className="landing-vs">VS</span>
              <div className="fighter landing-fighter">
                <div className="emoji">{demoBattle.defenderSnapshot.emoji}</div>
                <h3>{demoBattle.defenderSnapshot.name}</h3>
                <p className="muted">Lvl {demoBattle.defenderSnapshot.level}</p>
              </div>
            </div>
            <p className="landing-winner">
              <span className="landing-trophy" aria-hidden>
                🏆
              </span>
              <strong>
                {winner.emoji} {winner.name}
              </strong>{" "}
              gewinnt in {demoBattle.rounds} Runden
            </p>
          </aside>
        </div>

        <div className="landing-divider" aria-hidden />

        <ol className="landing-steps-row">
          {playSteps.map((step, index) => (
            <li className="landing-step-pill" key={step.title}>
              <span className="landing-step-index">{index + 1}</span>
              <div className="landing-step-copy">
                <span className="landing-step-emoji" aria-hidden>
                  {step.emoji}
                </span>
                <h2>{step.title}</h2>
                <p className="muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="landing-card-preview" aria-label="Beispielkarten">
          <p className="landing-card-preview-label muted">
            Karten geben deinem Emoji neue Kräfte
          </p>
          <div className="landing-card-row">
            {showcaseCards.map((card) => (
              <GameCard
                description={card.description}
                emoji={card.emoji}
                key={card.id}
                name={card.name}
                rarity={card.rarity}
                size="sm"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

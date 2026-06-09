import type { Route } from "next";
import Link from "next/link";

import { GameCard } from "@/components/cards/GameCard";
import type { CardRarity } from "@/lib/game/types";

export type BattleLootCard = {
  emoji: string;
  name: string;
  rarity: CardRarity;
  description: string;
};

export type BattleSummary = {
  won: boolean;
  opponentEmoji: string;
  opponentName: string;
  rounds: number;
  xpGained: number;
  loot?: BattleLootCard;
};

export function BattleResultScreen({ summary }: { summary: BattleSummary }) {
  const { won, opponentEmoji, opponentName, rounds, xpGained, loot } = summary;

  return (
    <section
      aria-labelledby="battle-result-title"
      className={`battle-result-screen${won ? " battle-result-win" : " battle-result-lose"}`}
    >
      <div className="battle-result-backdrop" aria-hidden="true" />

      <article className="panel battle-result-card">
        <p className="eyebrow">{won ? "Sieg!" : "Niederlage"}</p>
        <h2 className="battle-result-title" id="battle-result-title">
          {won ? "Du hast gewonnen!" : "Leider verloren."}
        </h2>
        <p className="lead battle-result-lead">
          {won
            ? `Du hast ${opponentEmoji} ${opponentName} besiegt.`
            : `${opponentEmoji} ${opponentName} war diesmal staerker.`}
        </p>

        <div className="battle-result-stats">
          <div className="battle-result-stat">
            <span className="battle-result-stat-label">Gegner</span>
            <strong>
              {opponentEmoji} {opponentName}
            </strong>
          </div>
          <div className="battle-result-stat">
            <span className="battle-result-stat-label">Runden</span>
            <strong>{rounds}</strong>
          </div>
          <div className="battle-result-stat">
            <span className="battle-result-stat-label">Erfahrung</span>
            <strong className={won ? "battle-result-xp-win" : ""}>
              +{xpGained} XP
            </strong>
          </div>
        </div>

        {won && loot ? (
          <div className="battle-result-loot">
            <p className="eyebrow">Beute</p>
            <div className="battle-result-loot-display">
              <GameCard
                description={loot.description}
                emoji={loot.emoji}
                name={loot.name}
                rarity={loot.rarity}
                size="lg"
              />
            </div>
            <p className="muted battle-result-loot-hint">
              Die Karte liegt jetzt in deiner Sammlung. Rueste sie auf der
              Karten-Seite aus.
            </p>
          </div>
        ) : won ? (
          <p className="muted battle-result-no-loot">
            Keine neue Karte diesmal — trotzdem hast du Erfahrung gesammelt.
          </p>
        ) : (
          <p className="muted battle-result-no-loot">
            Ueb dich an den Gegnern und versuch es gleich noch einmal.
          </p>
        )}

        <div className="actions battle-result-actions">
          <Link className="button primary" href={"/dashboard" as Route}>
            Mein Spiel
          </Link>
          <Link className="button" href={"/opponents" as Route}>
            Naechster Gegner
          </Link>
          {won && loot ? (
            <Link className="button" href={"/deck" as Route}>
              Karte ausruesten
            </Link>
          ) : null}
        </div>
      </article>
    </section>
  );
}

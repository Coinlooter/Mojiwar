import { CARD_RARITY_LABEL } from "@/constants/card-rarity";
import type { CardRarity } from "@/lib/game/types";

export type GameCardProps = {
  emoji: string;
  name: string;
  rarity: CardRarity;
  description?: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  className?: string;
};

export function GameCard({
  emoji,
  name,
  rarity,
  description,
  size = "md",
  active = false,
  className = "",
}: GameCardProps) {
  const classes = [
    "game-card",
    `game-card-${rarity}`,
    `game-card-${size}`,
    active ? "game-card-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article aria-label={`${name}, ${CARD_RARITY_LABEL[rarity]}`} className={classes}>
      <div className="game-card-frame">
        <div aria-hidden className="game-card-pattern" />
        <div className="game-card-inner">
          <span className="game-card-rarity">{CARD_RARITY_LABEL[rarity]}</span>
          <div aria-hidden className="game-card-art">
            {emoji}
          </div>
          <h3 className="game-card-name">{name}</h3>
          {description ? <p className="game-card-description">{description}</p> : null}
        </div>
      </div>
      {active ? <span className="game-card-active-badge">Im Deck</span> : null}
    </article>
  );
}

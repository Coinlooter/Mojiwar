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
  const hasTooltip = Boolean(description);
  const classes = [
    "game-card",
    `game-card-${rarity}`,
    `game-card-${size}`,
    active ? "game-card-active" : "",
    hasTooltip ? "game-card-has-stats" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      aria-label={
        description
          ? `${name}, ${CARD_RARITY_LABEL[rarity]}, ${description}`
          : `${name}, ${CARD_RARITY_LABEL[rarity]}`
      }
      className={classes}
      tabIndex={hasTooltip ? 0 : undefined}
    >
      <div className="game-card-frame">
        <div className="game-card-inner">
          <div aria-hidden className="game-card-art">
            {emoji}
          </div>
          <h3 className="game-card-name">{name}</h3>
        </div>
      </div>

      {hasTooltip ? (
        <div className="game-card-tooltip" role="tooltip">
          <p className="game-card-tooltip-title">{name}</p>
          <p className="game-card-tooltip-rarity">{CARD_RARITY_LABEL[rarity]}</p>
          <p className="game-card-tooltip-stat">{description}</p>
        </div>
      ) : null}

      {active ? <span className="game-card-active-badge">Im Deck</span> : null}
    </article>
  );
}

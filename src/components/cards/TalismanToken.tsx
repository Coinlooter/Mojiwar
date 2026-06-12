import { CARD_RARITY_LABEL } from "@/constants/card-rarity";
import type { CardRarity } from "@/lib/game/types";

export type TalismanTokenProps = {
  emoji: string;
  name: string;
  rarity: CardRarity;
  description?: string;
  size?: "sm" | "md";
  active?: boolean;
  className?: string;
};

export function TalismanToken({
  emoji,
  name,
  rarity,
  description,
  size = "sm",
  active = false,
  className = "",
}: TalismanTokenProps) {
  const hasTooltip = Boolean(description);
  const classes = [
    "talisman-token",
    `talisman-token-${rarity}`,
    `talisman-token-${size}`,
    active ? "talisman-token-active" : "",
    hasTooltip ? "talisman-token-has-stats" : "",
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
      <div className="talisman-token-octagon" aria-hidden>
        <div className="talisman-token-surface">
          <div className="talisman-token-emoji">{emoji}</div>
        </div>
      </div>

      {hasTooltip ? (
        <div className="talisman-token-tooltip" role="tooltip">
          <p className="talisman-token-tooltip-title">{name}</p>
          <p className="talisman-token-tooltip-rarity">{CARD_RARITY_LABEL[rarity]}</p>
          <p className="talisman-token-tooltip-stat">{description}</p>
        </div>
      ) : null}
    </article>
  );
}

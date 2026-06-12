import { getXpProgress } from "@/lib/game/leveling";

export function XpProgressBar({ xp, level }: { xp: number; level: number }) {
  const { percent } = getXpProgress(xp, level);
  const roundedPercent = Math.round(percent);

  return (
    <div className="xp-progress">
      <div className="xp-progress-label-row">
        <span className="xp-progress-label">Erfahrung</span>
        <span className="xp-progress-level-hint muted">Level {level + 1}</span>
      </div>
      <div
        aria-label={`Erfahrung ${roundedPercent} Prozent bis Level ${level + 1}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={roundedPercent}
        className="xp-progress-track"
        role="progressbar"
      >
        <div className="xp-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

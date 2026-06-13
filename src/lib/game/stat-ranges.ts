import type { CardEffectType } from "./types";

export type StatRange = {
  minValue: number;
  maxValue: number;
};

export function deriveStatRange(
  effectType: CardEffectType,
  baseValue: number,
): StatRange {
  if (baseValue < 1) {
    const delta = Math.max(0.01, Math.round(baseValue * 0.4 * 1000) / 1000);

    return {
      minValue: Math.max(0.01, Math.round((baseValue - delta) * 1000) / 1000),
      maxValue: Math.round((baseValue + delta) * 1000) / 1000,
    };
  }

  switch (effectType) {
    case "bonus_attack":
    case "bonus_defense":
    case "bonus_speed":
      return {
        minValue: Math.max(1, baseValue - 2),
        maxValue: baseValue + 2,
      };
    case "bonus_hp":
    case "low_hp_heal": {
      const delta = Math.max(4, Math.round(baseValue * 0.25));
      return {
        minValue: Math.max(1, baseValue - delta),
        maxValue: baseValue + delta,
      };
    }
    case "first_strike_damage":
    case "battle_frenzy_attack": {
      const delta = Math.max(3, Math.round(baseValue * 0.3));
      return {
        minValue: Math.max(1, baseValue - delta),
        maxValue: baseValue + delta,
      };
    }
    default: {
      const delta = Math.max(2, Math.round(baseValue * 0.25));
      return {
        minValue: Math.max(1, baseValue - delta),
        maxValue: baseValue + delta,
      };
    }
  }
}

export function rollStatInRange(
  minValue: number,
  maxValue: number,
  random: () => number,
): number {
  if (minValue >= maxValue) {
    return minValue;
  }

  if (maxValue < 1) {
    const steps = Math.round((maxValue - minValue) * 1000);
    const offset = Math.floor(random() * (steps + 1));
    return Math.round((minValue + offset / 1000) * 1000) / 1000;
  }

  const span = maxValue - minValue;
  return minValue + Math.floor(random() * (span + 1));
}

export function formatPassiveStatDescription(
  effectType: CardEffectType,
  value: number,
  options?: { passiveSuffix?: boolean },
) {
  const suffix = options?.passiveSuffix ? " (passiv)." : ".";

  switch (effectType) {
    case "bonus_hp":
      return `+${value} Leben${suffix}`;
    case "bonus_attack":
      return `+${value} Angriff${suffix}`;
    case "bonus_defense":
      return `+${value} Verteidigung${suffix}`;
    case "bonus_speed":
      return `+${value} Tempo${suffix}`;
    case "bonus_crit_chance":
      return `+${Math.round(value * 100)}% Kritchance${suffix}`;
    default:
      return `+${value}${suffix}`;
  }
}

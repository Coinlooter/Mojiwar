import {
  getAnimalGender,
  getColorPhraseForAnimal,
  resolveColorSlugFromPhrase,
} from "./recovery-grammar";
import {
  RECOVERY_ANIMAL_SLUGS,
  RECOVERY_ANIMALS,
  RECOVERY_COLOR_SLUGS,
  RECOVERY_COLORS,
  getRecoveryAnimalLabel,
  getRecoveryColorLabel,
} from "./recovery-words";

export type RecoveryCodeParts = {
  colorSlug: string;
  animalSlug: string;
  numberSuffix: string;
};

export function buildRecoveryCode(parts: RecoveryCodeParts) {
  const colorPhrase = getColorPhraseForAnimal(
    parts.colorSlug,
    getAnimalGender(parts.animalSlug),
  );

  return `${colorPhrase}${parts.animalSlug}${parts.numberSuffix}`;
}

export function formatRecoveryCodeDisplay(parts: RecoveryCodeParts) {
  return {
    combined: buildRecoveryCode(parts),
    colorLabel: getRecoveryColorLabel(parts.colorSlug),
    animalLabel: getRecoveryAnimalLabel(parts.animalSlug),
    numberSuffix: parts.numberSuffix,
  };
}

export function normalizeRecoveryCodeInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

export function isValidRecoveryNumberSuffix(value: string) {
  return /^\d{2}$/.test(value);
}

export function parseRecoveryCodeInput(value: string): RecoveryCodeParts | null {
  const normalized = normalizeRecoveryCodeInput(value);
  const suffixMatch = normalized.match(/(\d{2})$/);

  if (!suffixMatch || suffixMatch.index === undefined) {
    return null;
  }

  const numberSuffix = suffixMatch[1];
  const prefix = normalized.slice(0, suffixMatch.index);

  if (!prefix) {
    return null;
  }

  const animalsByLength = [...RECOVERY_ANIMALS].sort(
    (left, right) => right.slug.length - left.slug.length,
  );

  for (const animal of animalsByLength) {
    if (!prefix.endsWith(animal.slug)) {
      continue;
    }

    const colorPhrase = prefix.slice(0, prefix.length - animal.slug.length);
    const colorSlug = resolveColorSlugFromPhrase(colorPhrase);

    if (!colorSlug) {
      continue;
    }

    return {
      colorSlug,
      animalSlug: animal.slug,
      numberSuffix,
    };
  }

  return null;
}

export function validateRecoveryCodeParts(parts: RecoveryCodeParts) {
  return (
    RECOVERY_COLOR_SLUGS.has(parts.colorSlug) &&
    RECOVERY_ANIMAL_SLUGS.has(parts.animalSlug) &&
    isValidRecoveryNumberSuffix(parts.numberSuffix)
  );
}

export function getRecoveryCombinationCount() {
  return RECOVERY_COLORS.length * RECOVERY_ANIMALS.length * 100;
}

import {
  RECOVERY_ANIMALS,
  RECOVERY_COLORS,
  type AnimalGender,
} from "./recovery-words";

type DeclinableColorForms = {
  m: string;
  f: string;
  n: string;
};

const INDECLINABLE_COLOR_SLUGS = new Set(["lila", "rosa"]);

const DECLINABLE_COLOR_FORMS: Record<string, DeclinableColorForms> = {
  roter: { m: "roter", f: "rote", n: "rotes" },
  blauer: { m: "blauer", f: "blaue", n: "blaues" },
  gruener: { m: "gruener", f: "gruene", n: "gruenes" },
  gelber: { m: "gelber", f: "gelbe", n: "gelbes" },
  orangener: { m: "orangener", f: "orange", n: "oranges" },
  schwarzer: { m: "schwarzer", f: "schwarze", n: "schwarzes" },
  weisser: { m: "weisser", f: "weisse", n: "weisses" },
  brauner: { m: "brauner", f: "braune", n: "braunes" },
  grauer: { m: "grauer", f: "graue", n: "graues" },
  tuerkiser: { m: "tuerkiser", f: "tuerkise", n: "tuerkises" },
  pinker: { m: "pinker", f: "pinke", n: "pinkes" },
  goldener: { m: "goldener", f: "goldene", n: "goldenes" },
  silberner: { m: "silberner", f: "silberne", n: "silbernes" },
};

const ANIMAL_GENDER_BY_SLUG = new Map(
  RECOVERY_ANIMALS.map((animal) => [animal.slug, animal.gender]),
);

export function getAnimalGender(animalSlug: string): AnimalGender {
  return ANIMAL_GENDER_BY_SLUG.get(animalSlug) ?? "m";
}

export function getColorPhraseForAnimal(colorSlug: string, gender: AnimalGender) {
  if (INDECLINABLE_COLOR_SLUGS.has(colorSlug)) {
    return colorSlug;
  }

  const forms = DECLINABLE_COLOR_FORMS[colorSlug];

  if (!forms) {
    return colorSlug;
  }

  return forms[gender];
}

export function resolveColorSlugFromPhrase(phrase: string) {
  for (const color of RECOVERY_COLORS) {
    if (INDECLINABLE_COLOR_SLUGS.has(color.slug)) {
      if (phrase === color.slug) {
        return color.slug;
      }

      continue;
    }

    const forms = DECLINABLE_COLOR_FORMS[color.slug];

    if (!forms) {
      if (phrase === color.slug) {
        return color.slug;
      }

      continue;
    }

    if (phrase === forms.m || phrase === forms.f || phrase === forms.n) {
      return color.slug;
    }
  }

  return null;
}

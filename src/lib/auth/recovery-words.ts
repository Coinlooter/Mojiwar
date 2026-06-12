export type AnimalGender = "m" | "f" | "n";

export type RecoveryWord = {
  slug: string;
  label: string;
  gender?: AnimalGender;
};

export type RecoveryAnimal = RecoveryWord & {
  gender: AnimalGender;
};

export const RECOVERY_COLORS: RecoveryWord[] = [
  { slug: "roter", label: "Rot" },
  { slug: "blauer", label: "Blau" },
  { slug: "gruener", label: "Grün" },
  { slug: "gelber", label: "Gelb" },
  { slug: "orangener", label: "Orange" },
  { slug: "lila", label: "Lila" },
  { slug: "rosa", label: "Rosa" },
  { slug: "schwarzer", label: "Schwarz" },
  { slug: "weisser", label: "Weiß" },
  { slug: "brauner", label: "Braun" },
  { slug: "grauer", label: "Grau" },
  { slug: "tuerkiser", label: "Türkis" },
  { slug: "pinker", label: "Pink" },
  { slug: "goldener", label: "Gold" },
  { slug: "silberner", label: "Silber" },
];

export const RECOVERY_ANIMALS: RecoveryAnimal[] = [
  { slug: "elefant", label: "Elefant", gender: "m" },
  { slug: "fuchs", label: "Fuchs", gender: "m" },
  { slug: "frosch", label: "Frosch", gender: "m" },
  { slug: "panda", label: "Panda", gender: "m" },
  { slug: "tiger", label: "Tiger", gender: "m" },
  { slug: "loewe", label: "Löwe", gender: "m" },
  { slug: "affe", label: "Affe", gender: "m" },
  { slug: "hund", label: "Hund", gender: "m" },
  { slug: "katze", label: "Katze", gender: "f" },
  { slug: "vogel", label: "Vogel", gender: "m" },
  { slug: "drache", label: "Drache", gender: "m" },
  { slug: "einhorn", label: "Einhorn", gender: "n" },
  { slug: "baer", label: "Bär", gender: "m" },
  { slug: "wolf", label: "Wolf", gender: "m" },
  { slug: "hase", label: "Hase", gender: "m" },
  { slug: "maus", label: "Maus", gender: "f" },
  { slug: "pferd", label: "Pferd", gender: "n" },
  { slug: "kuh", label: "Kuh", gender: "f" },
  { slug: "schaf", label: "Schaf", gender: "n" },
  { slug: "ziege", label: "Ziege", gender: "f" },
  { slug: "huuhn", label: "Huhn", gender: "n" },
  { slug: "ente", label: "Ente", gender: "f" },
  { slug: "pinguin", label: "Pinguin", gender: "m" },
  { slug: "delfin", label: "Delfin", gender: "m" },
  { slug: "wal", label: "Wal", gender: "m" },
  { slug: "hai", label: "Hai", gender: "m" },
  { slug: "krake", label: "Krake", gender: "f" },
  { slug: "biene", label: "Biene", gender: "f" },
  { slug: "schmetterling", label: "Schmetterling", gender: "m" },
  { slug: "krokodil", label: "Krokodil", gender: "n" },
  { slug: "nashorn", label: "Nashorn", gender: "n" },
  { slug: "giraffe", label: "Giraffe", gender: "f" },
  { slug: "zebra", label: "Zebra", gender: "n" },
  { slug: "koala", label: "Koala", gender: "m" },
  { slug: "schnecke", label: "Schnecke", gender: "f" },
];

export const RECOVERY_COLOR_SLUGS = new Set(
  RECOVERY_COLORS.map((entry) => entry.slug),
);

export const RECOVERY_ANIMAL_SLUGS = new Set(
  RECOVERY_ANIMALS.map((entry) => entry.slug),
);

export function getRecoveryColorLabel(slug: string) {
  return RECOVERY_COLORS.find((entry) => entry.slug === slug)?.label ?? slug;
}

export function getRecoveryAnimalLabel(slug: string) {
  return RECOVERY_ANIMALS.find((entry) => entry.slug === slug)?.label ?? slug;
}

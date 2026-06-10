export type RecoveryWord = {
  slug: string;
  label: string;
};

export const RECOVERY_COLORS: RecoveryWord[] = [
  { slug: "roter", label: "Rot" },
  { slug: "blauer", label: "Blau" },
  { slug: "gruener", label: "Gruen" },
  { slug: "gelber", label: "Gelb" },
  { slug: "orangener", label: "Orange" },
  { slug: "lila", label: "Lila" },
  { slug: "rosa", label: "Rosa" },
  { slug: "schwarzer", label: "Schwarz" },
  { slug: "weisser", label: "Weiss" },
  { slug: "brauner", label: "Braun" },
  { slug: "grauer", label: "Grau" },
  { slug: "tuerkiser", label: "Tuerkis" },
  { slug: "pinker", label: "Pink" },
  { slug: "goldener", label: "Gold" },
  { slug: "silberner", label: "Silber" },
];

export const RECOVERY_ANIMALS: RecoveryWord[] = [
  { slug: "elefant", label: "Elefant" },
  { slug: "fuchs", label: "Fuchs" },
  { slug: "frosch", label: "Frosch" },
  { slug: "panda", label: "Panda" },
  { slug: "tiger", label: "Tiger" },
  { slug: "loewe", label: "Loewe" },
  { slug: "affe", label: "Affe" },
  { slug: "hund", label: "Hund" },
  { slug: "katze", label: "Katze" },
  { slug: "vogel", label: "Vogel" },
  { slug: "drache", label: "Drache" },
  { slug: "einhorn", label: "Einhorn" },
  { slug: "baer", label: "Baer" },
  { slug: "wolf", label: "Wolf" },
  { slug: "hase", label: "Hase" },
  { slug: "maus", label: "Maus" },
  { slug: "pferd", label: "Pferd" },
  { slug: "kuh", label: "Kuh" },
  { slug: "schaf", label: "Schaf" },
  { slug: "ziege", label: "Ziege" },
  { slug: "huuhn", label: "Huuhn" },
  { slug: "ente", label: "Ente" },
  { slug: "pinguin", label: "Pinguin" },
  { slug: "delfin", label: "Delfin" },
  { slug: "wal", label: "Wal" },
  { slug: "hai", label: "Hai" },
  { slug: "krake", label: "Krake" },
  { slug: "biene", label: "Biene" },
  { slug: "schmetterling", label: "Schmetterling" },
  { slug: "krokodil", label: "Krokodil" },
  { slug: "nashorn", label: "Nashorn" },
  { slug: "giraffe", label: "Giraffe" },
  { slug: "zebra", label: "Zebra" },
  { slug: "koala", label: "Koala" },
  { slug: "schnecke", label: "Schnecke" },
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

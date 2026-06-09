export type ChangelogEntry = {
  version: string;
  changes: string[];
};

// Bei neuen Releases zuerst eintragen (neueste Version oben).
export const CHANGELOG_VERSIONS: ChangelogEntry[] = [
  {
    version: "1.0.1",
    changes: [
      "Startseite — fester Header und Footer auf allen Seiten",
      "Footer — Versionsnummer mit klickbarem Changelog-Dialog",
      "Landing — ueberarbeitetes Hero-Layout ohne doppelte Navigation",
    ],
  },
  {
    version: "1.0.0",
    changes: [
      "Grundlage — Next.js App Router, TypeScript und Vitest",
      "Spiel — reine Battle Engine mit serverseitiger Kampfsimulation",
      "Daten — Supabase-Schema mit RLS fuer Profile, Charaktere, Karten und Kaempfe",
      "Auth — anonymer Sofort-spielen-Flow mit Onboarding und Dashboard",
      "Routen — Dashboard, Gegner, Deck und Demo-Kampf",
    ],
  },
];

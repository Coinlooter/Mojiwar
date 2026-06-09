export type ChangelogEntry = {
  version: string;
  changes: string[];
};

// Bei neuen Releases zuerst eintragen (neueste Version oben).
export const CHANGELOG_VERSIONS: ChangelogEntry[] = [
  {
    version: "1.1.1",
    changes: [
      "Gegner — zehn Übungsgegner mit steigender Staerke bis echte Spieler mitmachen",
    ],
  },
  {
    version: "1.1.0",
    changes: [
      "Spielablauf — Herausforderungen starten echte Kaempfe mit serverseitiger Aufloesung",
      "Onboarding — Starter-Deck mit drei Karten beim ersten Charakter",
      "Dashboard — Inbox mit letzten Kaempfen und Replay-Links",
      "Gegner — echte Spieler aus der Datenbank statt Demo-Daten",
      "Deck — Karten aus der Sammlung ausruesten und wieder entfernen",
      "Replay — gespeicherte Kaempfe unter /battle/[id]",
    ],
  },
  {
    version: "1.0.4",
    changes: [
      "Onboarding — Emoji-Auswahl mit 16 Helden statt fest vorgegebenem Emoji",
    ],
  },
  {
    version: "1.0.3",
    changes: [
      "UI — Header, Footer und Changelog-Fenster ohne Transparenz",
    ],
  },
  {
    version: "1.0.2",
    changes: [
      "Startseite — kindgerechte Spielsprache statt technischer Details",
      "Startseite — Emoji-Strip, So-spielst-du-Schritte und Karten-Showcase",
      "Navigation — Mein Spiel, Gegner und Karten statt Dashboard und Deck",
    ],
  },
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

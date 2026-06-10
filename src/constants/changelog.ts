export type ChangelogEntry = {
  version: string;
  changes: string[];
};

// Bei neuen Releases zuerst eintragen (neueste Version oben).
export const CHANGELOG_VERSIONS: ChangelogEntry[] = [
  {
    version: "1.4.3",
    changes: [
      "Dashboard — Logout nur noch im Header, nicht doppelt in der Seitenleiste",
    ],
  },
  {
    version: "1.4.2",
    changes: [
      "Startseite — eingeloggte Spieler werden direkt zum Dashboard weitergeleitet",
    ],
  },
  {
    version: "1.4.1",
    changes: [
      "Login/Logout — einheitliche Begriffe statt Fortschritt sichern/laden",
      "Login-Seite — Code eingeben oder neu spielen an einem Ort",
      "Dashboard — Login-Code und E-Mail direkt in der Seitenleiste",
    ],
  },
  {
    version: "1.4.0",
    changes: [
      "Fortschritt sichern — Speicher-Code aus Farbe, Tier und zwei Zahlen",
      "Fortschritt sichern — Eltern-E-Mail zum Verknuepfen des anonymen Accounts",
      "Fortschritt laden — Code auf neuem Geraet eingeben und Session wiederherstellen",
    ],
  },
  {
    version: "1.3.0",
    changes: [
      "Sicherheit — Kampf-RPC nur serverseitig, Character-Progression per Trigger geschuetzt",
      "Architektur — Page-Data-Helper, Battle-Log-Validierung und erweiterte Tests",
      "UX — Loading/Error/404, Gast-Nav, Tastatur-Inventar und Accessibility-Fixes",
    ],
  },
  {
    version: "1.2.4",
    changes: [
      "Branding — Spiel heisst jetzt Emojitsu (Repo, Vercel und UI)",
    ],
  },
  {
    version: "1.2.3",
    changes: [
      "Inventar — kompakteres Layout mit kleineren Karten und Slots nebeneinander",
    ],
  },
  {
    version: "1.2.2",
    changes: [
      "Navigation — Gegner heisst Kampf und erscheint erst nach Login",
      "Kampf-Seite — kompakte Gegnerauswahl mit Listen statt grosser Karten",
    ],
  },
  {
    version: "1.2.1",
    changes: [
      "Kampf — kompakter Replay-Bildschirm wie Sieg/Niederlage, weniger Scrollen auf Desktop",
    ],
  },
  {
    version: "1.2.0",
    changes: [
      "Navigation — Mein Spiel heisst jetzt Dashboard und erscheint erst nach Login",
      "Dashboard — kompakteres Layout mit weniger Scrollen auf Desktop",
    ],
  },
  {
    version: "1.1.9",
    changes: [
      "Hintergrund — Comic-Kampfszene mit kaempfenden Emojis als App-Wallpaper",
    ],
  },
  {
    version: "1.1.8",
    changes: [
      "Rangliste — Top-Spieler nach Siegen mit eigenem Platz und Navigation",
    ],
  },
  {
    version: "1.1.7",
    changes: [
      "Navigation — Menuepunkt Karten heisst jetzt Inventar",
      "Inventar — Karten per Drag and Drop in Deck-Slots ziehen und zurueck ins Inventar legen",
    ],
  },
  {
    version: "1.1.6",
    changes: [
      "Karten — neues Spielkarten-Design mit Muster und Qualitaets-Rand (Gewoehnlich, Selten, Episch)",
    ],
  },
  {
    version: "1.1.5",
    changes: [
      "UX — Ladeanzeige bei Buttons und Navigation, Startseite scrollt wieder mit dem Mausrad",
      "Performance — schnellere Gegner-Seite durch parallele Datenabfragen",
    ],
  },
  {
    version: "1.1.4",
    changes: [
      "Kampf-Arena — Emojis springen an, Schadenszahlen steigen auf, Lebensbalken zeigen HP live",
    ],
  },
  {
    version: "1.1.3",
    changes: [
      "Kampf — nach dem Replay erscheint ein Sieg- oder Niederlage-Bildschirm mit XP und Beute",
    ],
  },
  {
    version: "1.1.2",
    changes: [
      "Kampf-Replay — Kaempfe laufen automatisch ab, HP aktualisiert sich live",
    ],
  },
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

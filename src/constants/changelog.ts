export type ChangelogEntry = {
  version: string;
  changes: string[];
};

// Bei neuen Releases zuerst eintragen (neueste Version oben).
export const CHANGELOG_VERSIONS: ChangelogEntry[] = [
  {
    version: "1.15.5",
    changes: [
      "Angeln — Haken-Emoji 🪝 statt Schwimmer-Vektorgrafik am Schnurende",
    ],
  },
  {
    version: "1.15.4",
    changes: [
      "Angeln — Schwimmer folgt der Schnur beim Einholen und Auswerfen",
    ],
  },
  {
    version: "1.15.3",
    changes: [
      "Angeln — Schnur und Float enden im Wasser statt über dem Steg",
    ],
  },
  {
    version: "1.15.2",
    changes: [
      "Angeln — Angelrute als einfache Vektorgrafik statt Emoji, Schnur hängt an der Rutenspitze",
    ],
  },
  {
    version: "1.15.1",
    changes: [
      "Angeln — animierte Szene mit Angel, Schnur, Float und Wasserwellen",
      "Angeln — Auswerfen, Warten, Biss und Einholen in einer Endlosschleife",
      "Angeln — Catch-Animation beim Abholen der Beute",
    ],
  },
  {
    version: "1.15.0",
    changes: [
      "Angeln — Idle-Feature am Dashboard mit See-Hintergrund und Emoji auf dem Steg",
      "Angeln — Offline-Belohnung bis 24 Stunden mit passivem Gold und zufälligen Fisch-Fängen",
      "Angeln — Beute abholen setzt den Fang-Timer zurück",
    ],
  },
  {
    version: "1.14.0",
    changes: [
      "Karten-Drops — Affix-System mit 4 Qualitätsstufen: Gewöhnlich, Selten, Episch, Legendär",
      "Karten-Drops — Namen und Stats passen zu den vergebenen Affixen",
      "Karten-Drops — Legendär mit einzigartiger Kampf-Eigenschaft",
    ],
  },
  {
    version: "1.13.0",
    changes: [
      "Kampf — Fallback auf Übungsgegner und erweiterte Suche bei leerer Gegnerliste",
      "Rangliste — mobiles Karten-Layout statt horizontalem Scrollen",
      "Fehler — verständliche Meldungen statt leerer Listen oder technischer Texte",
    ],
  },
  {
    version: "1.12.3",
    changes: [
      "Kampf — Emoji-Position auf der Arena leicht nach unten korrigiert",
    ],
  },
  {
    version: "1.12.2",
    changes: [
      "Kampf — Emojis höher auf der Arena-Plattform positioniert",
      "Kampf — Schwert-Symbol in der Arena-Mitte entfernt",
    ],
  },
  {
    version: "1.12.1",
    changes: [
      "Kampf — Lebensbalken oben in der Arena statt mittig zwischen den Kämpfern",
      "Kampf — helleres Comic-Arena-Bild mit freundlicherer Atmosphäre",
    ],
  },
  {
    version: "1.12.0",
    changes: [
      "Kampf — Arena mit Hintergrundbild, Emojis kämpfen direkt in der Arena",
      "Kampf — Live-Log während des Kampfes entfernt",
      "Kampf — Kampf-Protokoll optional auf dem Abschlussbildschirm",
    ],
  },
  {
    version: "1.11.7",
    changes: [
      "Dashboard — Erfahrung als Fortschrittsbalken statt XP-Zahl",
    ],
  },
  {
    version: "1.11.6",
    changes: [
      "Inventar — alle Build-Slots haben dieselbe Kartengröße",
      "Inventar — Entfernen-Buttons entfallen, Ausrüsten nur per Drag & Drop",
    ],
  },
  {
    version: "1.11.5",
    changes: [
      "Karten — Seltenheit nur noch im Hover-Fenster, nicht auf der Karte",
      "Inventar — alle Karten haben dieselbe Größe im Build und Inventar",
    ],
  },
  {
    version: "1.11.4",
    changes: [
      "Onboarding — neuer Charakter startet mit leerem Build und leerem Inventar",
    ],
  },
  {
    version: "1.11.3",
    changes: [
      "Talismane — nur Emoji sichtbar, Name und Stats im Hover-Fenster",
    ],
  },
  {
    version: "1.11.2",
    changes: [
      "Talismane — eigene Darstellung mit Stein-Look statt Pergament-Karte",
      "Talismane — achteckige Form ohne Verzerrung, kompakter im Inventar",
    ],
  },
  {
    version: "1.11.1",
    changes: [
      "Kampf — Stärkeklasse auf −6 % bis +10 % angepasst",
    ],
  },
  {
    version: "1.11.0",
    changes: [
      "Kampf — eine gemeinsame Rangliste statt Trennung zwischen echten und KI-Gegnern",
      "Kampf — nur Gegner in derselben Stärkeklasse (±5 %) sind angreifbar",
      "Kampf — Kartenanzahl der Gegner wird wieder korrekt angezeigt",
    ],
  },
  {
    version: "1.10.0",
    changes: [
      "Inventar — nur noch Build und Inventar, alles Gesammelte an einem Ort",
      "Inventar — kompakteres Layout mit Talisman-Slot direkt im Build",
      "Talismane — achteckige Stoppschild-Form, Seltenheit am Rand erkennbar",
    ],
  },
  {
    version: "1.9.4",
    changes: [
      "Navigation — Ladebalken erscheint nicht mehr bei Klicks auf die aktuelle Seite",
    ],
  },
  {
    version: "1.9.3",
    changes: [
      "Login-Code — wird automatisch bei der ersten Anmeldung erzeugt",
      "Dashboard — Code erscheint direkt, ohne manuelle Buttons",
    ],
  },
  {
    version: "1.9.2",
    changes: [
      "Login-Code — grammatikalisch korrekte Form (z. B. goldenesschaf34 statt goldenerschaf34)",
      "Login — alte und intuitive Eingabevarianten werden weiterhin akzeptiert",
    ],
  },
  {
    version: "1.9.1",
    changes: [
      "Dashboard — Login-Code nur als Eingabeform mit Kopieren-Button",
      "Header — Ausloggen erst nach Code oder E-Mail-Sicherung",
      "Dashboard — Hinweis, wenn Fortschritt noch nicht gesichert ist",
    ],
  },
  {
    version: "1.9.0",
    changes: [
      "Inventar — freier Talisman-Slot von Anfang an sichtbar",
      "Inventar — Talismane ausrüsten und in eigener Sammlung verwalten",
      "Kampf — Talismane als seltenerer Beute-Drop (25 % vs. 75 % Karten)",
      "Kampf — Talismane geben passive Boni auf Stärke",
    ],
  },
  {
    version: "1.8.2",
    changes: [
      "Karten — Pergament-Hintergrund statt dunklem Muster",
    ],
  },
  {
    version: "1.8.1",
    changes: [
      "Startseite — kompakteres Layout ohne eigene Buttons, Spielen nur noch im Header",
    ],
  },
  {
    version: "1.8.0",
    changes: [
      "Inventar — bis zu 10 Deck-Slots, davon 3 von Anfang an freigeschaltet",
      "Inventar — gesperrte Slots zeigen nur „Noch nicht freigeschaltet“",
      "Inventar — Kartenwechsel bleibt kostenlos",
      "Header — Logout erst nach Charaktererstellung, Gäste sehen „Spielen“",
      "Dashboard — Fortschritt sichern statt Login, E-Mail-Bestätigung repariert",
      "E-Mail — verständliche Meldungen bei Rate-Limit oder bereits vergebener Adresse",
      "Login — E-Mail-Login erstellt keine doppelten Accounts mehr",
      "E-Mail — nach Bestätigung direkt zum Dashboard, wenn bereits ein Charakter existiert",
    ],
  },
  {
    version: "1.7.3",
    changes: [
      "Login — Spieler bleiben auf dem Gerät eingeloggt, Session wird in Cookies gespeichert",
      "Login — kompakter Bildschirm mit einem Feld für Code oder E-Mail",
      "Navigation — Rangliste nur noch im Dashboard, nicht mehr im Header für Gäste",
    ],
  },
  {
    version: "1.7.2",
    changes: [
      "Texte — durchgängig korrekte Umlaute (ä, ö, ü) statt ae, oe, ue",
    ],
  },
  {
    version: "1.7.1",
    changes: [
      "Dashboard — einfachere Texte für neue Spieler ohne technische Begriffe",
    ],
  },
  {
    version: "1.7.0",
    changes: [
      "Gold — Sieger erhalten Gold aus Kämpfen, Anzeige im Dashboard und Kampfergebnis",
    ],
  },
  {
    version: "1.6.2",
    changes: [
      "Kampf — Start-Overlay mit VS-Animation statt stillem Formular-Redirect",
    ],
  },
  {
    version: "1.6.1",
    changes: [
      "Inventar — sofortiges UI beim Kartenwechsel, weniger Server-Wartezeit",
    ],
  },
  {
    version: "1.6.0",
    changes: [
      "Karten — Muster-Hintergrund und Stats-Tooltip beim Hover",
    ],
  },
  {
    version: "1.5.5",
    changes: [
      "Inventar — Build-Karten auf Desktop auf gleiche Größe wie Sammlung begrenzt",
    ],
  },
  {
    version: "1.5.4",
    changes: [
      "Inventar — kompakteres Layout mit kleineren Karten und einem Panel",
    ],
  },
  {
    version: "1.5.3",
    changes: [
      "Inventar — Sammlung ohne Slot-Buttons, einheitliche Karten-Größe, klarer Build-Bereich",
    ],
  },
  {
    version: "1.5.2",
    changes: [
      "Header — eingeloggt nur noch Logo und Logout, Navigation über das Dashboard",
    ],
  },
  {
    version: "1.5.1",
    changes: [
      "Header — Navigation und Logout nutzen jetzt auch Bubble-Buttons",
    ],
  },
  {
    version: "1.5.0",
    changes: [
      "UI — dicke bunte Bubble-Buttons mit 3D-Effekt statt flacher Tabellen-Optik",
      "Kampf — Herausfordern-Buttons als lila Primär-Bubbles",
      "Onboarding — Emoji-Auswahl als farbige Bubble-Kacheln",
    ],
  },
  {
    version: "1.4.5",
    changes: [
      "Dashboard — interne Recovery-E-Mail wird Spielern nicht mehr angezeigt",
    ],
  },
  {
    version: "1.4.4",
    changes: [
      "Dashboard — E-Mail statt Eltern-E-Mail in der Login-Seitenleiste",
    ],
  },
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
      "Fortschritt sichern — Eltern-E-Mail zum Verknüpfen des anonymen Accounts",
      "Fortschritt laden — Code auf neuem Gerät eingeben und Session wiederherstellen",
    ],
  },
  {
    version: "1.3.0",
    changes: [
      "Sicherheit — Kampf-RPC nur serverseitig, Character-Progression per Trigger geschützt",
      "Architektur — Page-Data-Helper, Battle-Log-Validierung und erweiterte Tests",
      "UX — Loading/Error/404, Gast-Nav, Tastatur-Inventar und Accessibility-Fixes",
    ],
  },
  {
    version: "1.2.4",
    changes: [
      "Branding — Spiel heißt jetzt Emojitsu (Repo, Vercel und UI)",
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
      "Navigation — Gegner heißt Kampf und erscheint erst nach Login",
      "Kampf-Seite — kompakte Gegnerauswahl mit Listen statt größer Karten",
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
      "Navigation — Mein Spiel heißt jetzt Dashboard und erscheint erst nach Login",
      "Dashboard — kompakteres Layout mit weniger Scrollen auf Desktop",
    ],
  },
  {
    version: "1.1.9",
    changes: [
      "Hintergrund — Comic-Kampfszene mit kämpfenden Emojis als App-Wallpaper",
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
      "Navigation — Menüpunkt Karten heißt jetzt Inventar",
      "Inventar — Karten per Drag and Drop in Deck-Slots ziehen und zurück ins Inventar legen",
    ],
  },
  {
    version: "1.1.6",
    changes: [
      "Karten — neues Spielkarten-Design mit Muster und Qualitäts-Rand (Gewöhnlich, Selten, Episch)",
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
      "Kampf-Replay — Kämpfe laufen automatisch ab, HP aktualisiert sich live",
    ],
  },
  {
    version: "1.1.1",
    changes: [
      "Gegner — zehn Übungsgegner mit steigender Stärke bis echte Spieler mitmachen",
    ],
  },
  {
    version: "1.1.0",
    changes: [
      "Spielablauf — Herausforderungen starten echte Kämpfe mit serverseitiger Auflösung",
      "Onboarding — Starter-Deck mit drei Karten beim ersten Charakter",
      "Dashboard — Inbox mit letzten Kämpfen und Replay-Links",
      "Gegner — echte Spieler aus der Datenbank statt Demo-Daten",
      "Deck — Karten aus der Sammlung ausrüsten und wieder entfernen",
      "Replay — gespeicherte Kämpfe unter /battle/[id]",
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
      "Landing — überarbeitetes Hero-Layout ohne doppelte Navigation",
    ],
  },
  {
    version: "1.0.0",
    changes: [
      "Grundlage — Next.js App Router, TypeScript und Vitest",
      "Spiel — reine Battle Engine mit serverseitiger Kampfsimulation",
      "Daten — Supabase-Schema mit RLS für Profile, Charaktere, Karten und Kämpfe",
      "Auth — anonymer Sofort-spielen-Flow mit Onboarding und Dashboard",
      "Routen — Dashboard, Gegner, Deck und Demo-Kampf",
    ],
  },
];

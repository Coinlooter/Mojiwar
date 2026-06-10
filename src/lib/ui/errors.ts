export const DECK_ERROR_MESSAGES = {
  invalid: "Diese Karte konnte nicht platziert werden.",
  card: "Diese Karte gehoert dir nicht.",
  slot: "Das Inventar konnte gerade nicht aktualisiert werden.",
} as const;

export const OPPONENT_ERROR_MESSAGES: Record<string, string> = {
  invalid: "Dieser Gegner konnte nicht herausgefordert werden.",
  self: "Du kannst dich nicht selbst herausfordern.",
  missing: "Der Gegner wurde nicht gefunden.",
  battle: "Der Kampf konnte gerade nicht gestartet werden. Versuche es erneut.",
};

export const ONBOARDING_ERROR_MESSAGES: Record<string, string> = {
  invalid: "Bitte waehle ein Emoji und gib einen gueltigen Namen ein.",
  profile: "Dein Profil konnte nicht gespeichert werden.",
  character: "Dein Held konnte nicht erstellt werden.",
  deck: "Das Starter-Deck konnte nicht vergeben werden.",
};

export function getSearchParamErrorMessage(
  error: string | undefined,
  messages: Record<string, string>,
) {
  return error ? messages[error] : null;
}

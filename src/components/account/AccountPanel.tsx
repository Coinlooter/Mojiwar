import { RecoveryCodeDisplay } from "@/components/account/RecoveryCodeDisplay";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  getDisplayEmail,
  hasSecuredEmailAccount,
  usesLoginCodeAccount,
} from "@/lib/auth/account-email";
import { getRecoveryCodeForUser } from "@/lib/auth/progress-recovery";
import {
  createRecoveryCode,
  linkParentEmail,
  regenerateRecoveryCode,
} from "@/app/account/secure/actions";

const statusMessages: Record<string, string> = {
  created: "Dein Code ist bereit. Schreib ihn auf oder mach ein Foto.",
  regenerated: "Dein neuer Code ist aktiv. Der alte Code funktioniert nicht mehr.",
  "email-sent":
    "Wir haben eine E-Mail geschickt. Bitte bestätige den Link, um deinen Fortschritt zu sichern.",
};

const errorMessages: Record<string, string> = {
  "invalid-email": "Bitte gib eine gültige E-Mail-Adresse ein.",
  "email-failed": "Die E-Mail konnte nicht gesendet werden. Versuche es gleich noch einmal.",
  "email-in-use":
    "Diese E-Mail wird schon für einen anderen Spielfortschritt verwendet. Nutze eine andere Adresse oder logge dich damit ein.",
  "email-rate-limit":
    "Gerade wurden zu viele E-Mails verschickt. Bitte warte ein paar Minuten und versuche es dann erneut.",
  "already-secured": "Dein Fortschritt ist bereits per E-Mail gesichert.",
};

export async function AccountPanel({
  userId,
  isAnonymous,
  email,
  loginStatus,
  loginError,
}: {
  userId: string;
  isAnonymous: boolean;
  email?: string | null;
  loginStatus?: string;
  loginError?: string;
}) {
  const recoveryCode = await getRecoveryCodeForUser(userId);
  const displayEmail = getDisplayEmail(email);
  const securedWithEmail = hasSecuredEmailAccount({ isAnonymous, email });
  const showLoginCodeFlow = usesLoginCodeAccount({ isAnonymous, email });
  const statusMessage = loginStatus ? statusMessages[loginStatus] : null;
  const errorMessage = loginError ? errorMessages[loginError] : null;

  return (
    <article className="panel battle-card dashboard-account">
      <p className="eyebrow">Auf anderem Gerät weiterspielen</p>

      {statusMessage ? (
        <p className="account-status account-status-inline" role="status">
          {statusMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="account-error account-error-inline" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {securedWithEmail && displayEmail ? (
        <p className="muted dashboard-account-copy">
          Fortschritt gesichert mit {displayEmail}. Du kannst auf jedem Gerät mit
          dieser E-Mail weiterspielen.
        </p>
      ) : recoveryCode ? (
        <>
          <p className="muted dashboard-account-copy">
            Mit diesem Code kannst du auf einem anderen Gerät weiterspielen.
          </p>
          <RecoveryCodeDisplay parts={recoveryCode} />
          {showLoginCodeFlow ? (
            <form action={regenerateRecoveryCode}>
              <SubmitButton pendingLabel="Neuer Code...">Neuen Code</SubmitButton>
            </form>
          ) : null}
        </>
      ) : showLoginCodeFlow ? (
        <>
          <p className="muted dashboard-account-copy">
            Erstelle einen Code, um deinen Fortschritt auf einem anderen Gerät
            fortzusetzen.
          </p>
          <form action={createRecoveryCode}>
            <SubmitButton pendingLabel="Code wird erstellt..." variant="primary">
              Code erstellen
            </SubmitButton>
          </form>
        </>
      ) : null}

      {showLoginCodeFlow ? (
        <details className="account-details dashboard-account-details">
          <summary>Oder per E-Mail sichern</summary>
          <form action={linkParentEmail} className="account-email-form">
            <label className="field-label" htmlFor="account-email">
              E-Mail-Adresse
            </label>
            <input
              autoComplete="email"
              className="text-input"
              id="account-email"
              name="email"
              placeholder="deine@email.de"
              required
              type="email"
            />
            <SubmitButton pendingLabel="E-Mail wird gesendet..." variant="primary">
              Bestätigungs-E-Mail senden
            </SubmitButton>
          </form>
        </details>
      ) : null}
    </article>
  );
}

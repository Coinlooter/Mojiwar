import { RecoveryCodeDisplay } from "@/components/account/RecoveryCodeDisplay";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getRecoveryCodeForUser } from "@/lib/auth/progress-recovery";
import {
  createRecoveryCode,
  linkParentEmail,
  regenerateRecoveryCode,
} from "@/app/account/secure/actions";

const statusMessages: Record<string, string> = {
  created: "Dein Login-Code ist bereit. Schreib ihn auf oder mach ein Foto.",
  regenerated: "Dein neuer Login-Code ist aktiv. Der alte Code funktioniert nicht mehr.",
  "email-sent": "Wir haben eine E-Mail geschickt. Bitte bestaetige den Link.",
};

const errorMessages: Record<string, string> = {
  "invalid-email": "Bitte gib eine gueltige E-Mail-Adresse ein.",
  "email-failed": "Die E-Mail konnte nicht gesendet werden.",
  "already-secured": "Dein Login ist bereits per E-Mail gesichert.",
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
  const statusMessage = loginStatus ? statusMessages[loginStatus] : null;
  const errorMessage = loginError ? errorMessages[loginError] : null;

  return (
    <article className="panel battle-card dashboard-account">
      <p className="eyebrow">Login</p>

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

      {!isAnonymous ? (
        <p className="muted dashboard-account-copy">
          Eingeloggt{email ? ` als ${email}` : ""}.
        </p>
      ) : recoveryCode ? (
        <>
          <p className="muted dashboard-account-copy">
            Mit diesem Code kannst du dich auf anderen Geraeten einloggen.
          </p>
          <RecoveryCodeDisplay parts={recoveryCode} />
          <form action={regenerateRecoveryCode}>
            <SubmitButton pendingLabel="Neuer Code...">Neuen Code</SubmitButton>
          </form>
        </>
      ) : (
        <>
          <p className="muted dashboard-account-copy">
            Erstelle deinen Login-Code, damit du dich spaeter wieder einloggen
            kannst.
          </p>
          <form action={createRecoveryCode}>
            <SubmitButton pendingLabel="Code wird erstellt..." variant="primary">
              Login-Code erstellen
            </SubmitButton>
          </form>
        </>
      )}

      {isAnonymous ? (
        <details className="account-details dashboard-account-details">
          <summary>Oder mit E-Mail einloggen</summary>
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
              E-Mail senden
            </SubmitButton>
          </form>
        </details>
      ) : null}
    </article>
  );
}

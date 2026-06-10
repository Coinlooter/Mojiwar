import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { RecoveryCodeDisplay } from "@/components/account/RecoveryCodeDisplay";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getRecoveryCodeForUser } from "@/lib/auth/progress-recovery";
import { requireUser } from "@/lib/auth/require-character";
import {
  createRecoveryCode,
  linkParentEmail,
  regenerateRecoveryCode,
} from "./actions";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  "created=1":
    "Dein Speicher-Code ist bereit. Schreib ihn auf oder mach ein Foto.",
  "regenerated=1": "Dein neuer Speicher-Code ist aktiv. Der alte Code funktioniert nicht mehr.",
  "email-sent=1":
    "Wir haben eine E-Mail geschickt. Bitte bestaetige den Link, um den Account zu sichern.",
};

const errorMessages: Record<string, string> = {
  "invalid-email": "Bitte gib eine gueltige E-Mail-Adresse ein.",
  "email-failed": "Die E-Mail konnte nicht gesendet werden. Versuche es erneut.",
  "already-secured": "Dein Account ist bereits gesichert.",
};

export default async function SecureProgressPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { user } = await requireUser();
  const params = await searchParams;
  const recoveryCode = await getRecoveryCodeForUser(user.id);
  const isAnonymous = user.is_anonymous;
  const statusKey = Object.keys(statusMessages).find((key) => {
    const [param, value] = key.split("=");
    return params[param] === value;
  });
  const statusMessage = statusKey ? statusMessages[statusKey] : null;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  if (!isAnonymous && !recoveryCode) {
    redirect("/dashboard" as Route);
  }

  return (
    <div className="account-page">
      <header className="panel battle-card account-top">
        <p className="eyebrow">Fortschritt sichern</p>
        <h1>Behalte deinen Helden auch auf anderen Geraeten.</h1>
        <p className="muted account-top-copy">
          Waehle eine Methode: Speicher-Code fuer Kinder ohne E-Mail oder eine
          Eltern-E-Mail fuer dauerhaftes Login.
        </p>
      </header>

      {statusMessage ? (
        <p className="account-status" role="status">
          {statusMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="account-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="account-grid">
        <section className="panel battle-card account-panel">
          <p className="eyebrow">Speicher-Code</p>
          <p className="muted account-form-copy">
            Ein merkbarer Code aus Farbe, Tier und zwei Zahlen — zum Beispiel
            Blau · Elefant · 65 (blauerelefant65).
          </p>

          {recoveryCode ? (
            <>
              <RecoveryCodeDisplay parts={recoveryCode} />
              {isAnonymous ? (
                <form action={regenerateRecoveryCode}>
                  <SubmitButton pendingLabel="Neuer Code...">
                    Neuen Code erzeugen
                  </SubmitButton>
                </form>
              ) : null}
            </>
          ) : isAnonymous ? (
            <form action={createRecoveryCode}>
              <SubmitButton pendingLabel="Code wird erstellt..." variant="primary">
                Speicher-Code erstellen
              </SubmitButton>
            </form>
          ) : (
            <p className="muted">Dein Account ist bereits per E-Mail gesichert.</p>
          )}
        </section>

        <section className="panel battle-card account-panel">
          <p className="eyebrow">Eltern-E-Mail</p>
          <p className="muted account-form-copy">
            Fuer dauerhaftes Login und Wiederherstellung auf jedem Geraet.
          </p>

          {isAnonymous ? (
            <form action={linkParentEmail} className="account-email-form">
              <label className="field-label" htmlFor="email">
                E-Mail-Adresse
              </label>
              <input
                autoComplete="email"
                className="text-input"
                id="email"
                name="email"
                placeholder="eltern@beispiel.de"
                required
                type="email"
              />
              <SubmitButton pendingLabel="E-Mail wird gesendet..." variant="primary">
                Mit E-Mail sichern
              </SubmitButton>
            </form>
          ) : (
            <p className="muted">
              Gesichert als <strong>{user.email}</strong>.
            </p>
          )}
        </section>
      </div>

      <div className="actions account-actions">
        <Link className="button" href="/dashboard">
          Zurueck zum Dashboard
        </Link>
        <Link className="button" href={"/account/load" as Route}>
          Fortschritt auf diesem Geraet laden
        </Link>
      </div>
    </div>
  );
}

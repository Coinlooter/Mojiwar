import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/account/LoginForm";
import { StartPlayingButton } from "@/components/auth/StartPlayingButton";
import { getVerifiedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  "invalid-code": "Dieser Login-Code ist ungültig. Bitte prüfe deine Eingabe.",
  "invalid-email": "Bitte gib eine gültige E-Mail-Adresse ein.",
  "invalid-input": "Bitte gib deinen Login-Code oder deine E-Mail ein.",
  "not-found": "Dieser Login-Code wurde nicht gefunden.",
  "rate-limit": "Zu viele Versuche. Bitte warte eine Minute.",
  session: "Login hat gerade nicht geklappt. Versuche es erneut.",
  "email-failed": "Die E-Mail konnte nicht gesendet werden. Versuche es gleich noch einmal.",
  "email-in-use":
    "Diese E-Mail wird schon für einen anderen Spielfortschritt verwendet.",
  "email-rate-limit":
    "Gerade wurden zu viele E-Mails verschickt. Bitte warte ein paar Minuten.",
};

const successMessages: Record<string, string> = {
  "email-sent":
    "Wir haben dir einen Link geschickt. Öffne die E-Mail und klicke darauf, um dich einzuloggen.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; login?: string }>;
}) {
  const { user } = await getVerifiedUser();

  if (user) {
    redirect("/dashboard" as Route);
  }

  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;
  const successMessage = params.login ? successMessages[params.login] : null;

  return (
    <div className="account-page login-page">
      <section className="panel battle-card login-card">
        <header className="login-card-header">
          <p className="eyebrow">Login</p>
          <h1>Willkommen zurück!</h1>
        </header>

        {errorMessage ? (
          <p className="account-error account-error-inline" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="account-status account-status-inline" role="status">
            {successMessage}
          </p>
        ) : null}

        <LoginForm />

        <div className="login-divider" aria-hidden />

        <div className="login-alt">
          <p className="muted login-alt-copy">Noch kein Konto?</p>
          <StartPlayingButton>Neu spielen</StartPlayingButton>
        </div>
      </section>

      <div className="actions account-actions login-footer-actions">
        <Link className="button" href="/">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

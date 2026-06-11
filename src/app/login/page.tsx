import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/account/LoginForm";
import { StartPlayingButton } from "@/components/auth/StartPlayingButton";
import { getVerifiedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  "invalid-code": "Bitte prüfe Farbe, Tier und die zwei Zahlen.",
  "not-found": "Dieser Login-Code wurde nicht gefunden.",
  "rate-limit": "Zu viele Versuche. Bitte warte eine Minute.",
  session: "Login hat gerade nicht geklappt. Versuche es erneut.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user } = await getVerifiedUser();

  if (user) {
    redirect("/dashboard" as Route);
  }

  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <div className="account-page login-page">
      <header className="panel battle-card account-top">
        <p className="eyebrow">Login</p>
        <h1>Willkommen zurück!</h1>
        <p className="muted account-top-copy">
          Gib deinen Login-Code ein — aus Farbe, Tier und zwei Zahlen.
        </p>
      </header>

      {errorMessage ? (
        <p className="account-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <LoginForm />

      <section className="panel battle-card login-new-player">
        <p className="eyebrow">Neu hier?</p>
        <p className="muted account-form-copy">
          Starte ein neues Spiel. Danach bekommst du im Dashboard deinen
          Login-Code.
        </p>
        <StartPlayingButton>Neu spielen</StartPlayingButton>
      </section>

      <div className="actions account-actions">
        <Link className="button" href="/">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

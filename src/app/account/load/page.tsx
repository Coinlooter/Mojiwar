import Link from "next/link";
import type { Route } from "next";

import { LoadProgressForm } from "@/components/account/LoadProgressForm";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  "invalid-code": "Bitte pruefe Farbe, Tier und die zwei Zahlen.",
  "not-found": "Dieser Speicher-Code wurde nicht gefunden.",
  "rate-limit": "Zu viele Versuche. Bitte warte eine Minute.",
  session: "Der Fortschritt konnte gerade nicht geladen werden. Versuche es erneut.",
};

export default async function LoadProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <div className="account-page">
      <header className="panel battle-card account-top">
        <p className="eyebrow">Fortschritt laden</p>
        <h1>Hole deinen Helden auf dieses Geraet zurueck.</h1>
        <p className="muted account-top-copy">
          Gib den Speicher-Code ein, den du beim Sichern aufgeschrieben hast.
        </p>
      </header>

      {errorMessage ? (
        <p className="account-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <LoadProgressForm />

      <div className="actions account-actions">
        <Link className="button" href="/">
          Zur Startseite
        </Link>
        <Link className="button" href={"/account/secure" as Route}>
          Stattdessen Fortschritt sichern
        </Link>
      </div>
    </div>
  );
}

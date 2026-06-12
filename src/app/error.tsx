"use client";

import { GENERIC_ERROR_MESSAGE } from "@/lib/ui/load-result";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="error-page panel battle-card">
      <p className="eyebrow">Fehler</p>
      <h1>Etwas ist schiefgelaufen.</h1>
      <p className="muted error-page-copy">{GENERIC_ERROR_MESSAGE}</p>
      <div className="actions">
        <button className="button primary" onClick={reset} type="button">
          Erneut versuchen
        </button>
      </div>
    </section>
  );
}

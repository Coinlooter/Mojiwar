"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="error-page panel battle-card">
      <p className="eyebrow">Fehler</p>
      <h1>Etwas ist schiefgelaufen.</h1>
      <p className="muted error-page-copy">
        {error.message || "Die Seite konnte gerade nicht geladen werden."}
      </p>
      <div className="actions">
        <button className="button primary" onClick={reset} type="button">
          Erneut versuchen
        </button>
      </div>
    </section>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found-page panel battle-card">
      <p className="eyebrow">404</p>
      <h1>Diese Seite gibt es nicht.</h1>
      <p className="muted not-found-copy">
        Vielleicht wurde der Kampf gelöscht oder der Link ist veraltet.
      </p>
      <div className="actions">
        <Link className="button primary" href="/">
          Zur Startseite
        </Link>
        <Link className="button" href="/dashboard">
          Zum Dashboard
        </Link>
      </div>
    </section>
  );
}

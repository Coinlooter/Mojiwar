"use client";

import { useEffect, useId, useRef, useState } from "react";

import pkg from "../../../package.json";
import { CHANGELOG_VERSIONS } from "@/constants/changelog";

export function SiteFooter() {
  const [showChangelog, setShowChangelog] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!showChangelog) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    const closeButton = dialogRef.current?.querySelector("button");

    closeButton?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowChangelog(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [showChangelog]);

  return (
    <>
      <footer className="site-footer glass-chrome">
        <div className="site-chrome-inner site-footer-inner" data-testid="site-footer">
          <span className="footer-meta">
            Baue dein Emoji · kämpfe gegen andere · sammle Karten
          </span>
          <span className="footer-separator" aria-hidden>
            ·
          </span>
          <a
            className="footer-link"
            href="https://github.com/Coinlooter/Emojitsu"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <span className="footer-separator" aria-hidden>
            ·
          </span>
          <button
            aria-label={`Changelog für Version ${pkg.version} öffnen`}
            className="footer-version"
            onClick={() => setShowChangelog(true)}
            type="button"
          >
            v{pkg.version}
          </button>
        </div>
      </footer>

      {showChangelog ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="changelog-backdrop"
          onClick={() => setShowChangelog(false)}
          role="dialog"
        >
          <div
            className="changelog-dialog"
            onClick={(event) => event.stopPropagation()}
            ref={dialogRef}
          >
            <div className="changelog-header">
              <h2 id={titleId}>Changelog</h2>
              <button
                className="button"
                onClick={() => setShowChangelog(false)}
                type="button"
              >
                Schliessen
              </button>
            </div>

            <div className="changelog-list">
              {CHANGELOG_VERSIONS.map((entry) => (
                <section className="changelog-entry" key={entry.version}>
                  <h3>v{entry.version}</h3>
                  <ul>
                    {entry.changes.map((change) => (
                      <li key={change}>{change}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

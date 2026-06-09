"use client";

import { useState } from "react";

import pkg from "../../../package.json";
import { CHANGELOG_VERSIONS } from "@/constants/changelog";

export function SiteFooter() {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <>
      <footer className="site-footer glass-chrome">
        <div className="site-chrome-inner site-footer-inner" data-testid="site-footer">
          <span className="footer-meta">
            Asynchrones Multiplayer-RPG · serverseitige Kaempfe · permanente Karten
          </span>
          <span className="footer-separator" aria-hidden>
            ·
          </span>
          <a
            className="footer-link"
            href="https://github.com/Coinlooter/Mojiwar"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <span className="footer-separator" aria-hidden>
            ·
          </span>
          <button
            aria-label={`Changelog fuer Version ${pkg.version} oeffnen`}
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
          aria-label="Changelog"
          aria-modal="true"
          className="changelog-backdrop"
          onClick={() => setShowChangelog(false)}
          role="dialog"
        >
          <div
            className="changelog-dialog panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="changelog-header">
              <h2>Changelog</h2>
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

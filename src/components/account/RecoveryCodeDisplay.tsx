"use client";

import { useState } from "react";

import { buildRecoveryCode, type RecoveryCodeParts } from "@/lib/auth/recovery-code";

export function RecoveryCodeDisplay({ parts }: { parts: RecoveryCodeParts }) {
  const code = buildRecoveryCode(parts);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="recovery-code-display" role="status">
      <p className="recovery-code-label">Dein Login-Code</p>
      <div className="recovery-code-row">
        <code className="recovery-code-value">{code}</code>
        <button
          aria-label={copied ? "Code kopiert" : "Login-Code kopieren"}
          className="recovery-code-copy"
          onClick={() => {
            void handleCopy();
          }}
          type="button"
        >
          <span aria-hidden className="recovery-code-copy-icon">
            {copied ? "✓" : "⧉"}
          </span>
          <span className="recovery-code-copy-label">
            {copied ? "Kopiert" : "Kopieren"}
          </span>
        </button>
      </div>
      <p className="muted recovery-code-hint">
        Gib diesen Code auf einem anderen Gerät unter Spielen ein.
      </p>
    </div>
  );
}

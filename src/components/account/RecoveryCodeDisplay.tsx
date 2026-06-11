import { formatRecoveryCodeDisplay, type RecoveryCodeParts } from "@/lib/auth/recovery-code";

export function RecoveryCodeDisplay({ parts }: { parts: RecoveryCodeParts }) {
  const display = formatRecoveryCodeDisplay(parts);

  return (
    <div className="recovery-code-display" role="status">
      <p className="recovery-code-label">Dein Login-Code</p>
      <p className="recovery-code-value" aria-label={`Login-Code ${display.combined}`}>
        <span>{display.colorLabel}</span>
        <span aria-hidden>·</span>
        <span>{display.animalLabel}</span>
        <span aria-hidden>·</span>
        <span>{display.numberSuffix}</span>
      </p>
      <p className="muted recovery-code-hint">
        Schreib ihn auf oder mach ein Foto. Damit loggst du dich auf anderen Geräten
        ein.
      </p>
      <p className="muted recovery-code-compact">
        Kurzform: <code>{display.combined}</code>
      </p>
    </div>
  );
}

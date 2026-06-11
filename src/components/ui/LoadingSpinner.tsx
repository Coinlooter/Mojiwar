export function LoadingSpinner({ label = "Lädt" }: { label?: string }) {
  return (
    <span aria-hidden className="loading-spinner">
      <span className="loading-spinner-icon" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

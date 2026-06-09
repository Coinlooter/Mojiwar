export function LoadingSpinner({ label = "Laedt" }: { label?: string }) {
  return (
    <span aria-hidden className="loading-spinner">
      <span className="loading-spinner-icon" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

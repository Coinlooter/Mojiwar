export function RouteLoading({
  label = "Seite wird geladen...",
}: {
  label?: string;
}) {
  return (
    <div aria-busy="true" aria-live="polite" className="route-loading">
      <div className="route-loading-panel panel battle-card">
        <div className="route-loading-bar" />
        <div className="route-loading-bar route-loading-bar-short" />
        <p className="muted route-loading-label">{label}</p>
      </div>
    </div>
  );
}

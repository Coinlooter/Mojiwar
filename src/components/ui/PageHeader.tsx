export function PageHeader({
  eyebrow,
  title,
  lead,
  className = "",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  const classes = ["page-header", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      {lead ? <p className="muted page-header-lead">{lead}</p> : null}
    </div>
  );
}

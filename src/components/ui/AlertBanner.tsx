export function AlertBanner({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const classes = ["alert-error", className].filter(Boolean).join(" ");

  return (
    <p className={classes} role="alert">
      {children}
    </p>
  );
}

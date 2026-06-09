"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function SubmitButton({
  children,
  pendingLabel,
  className = "button",
  variant,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: "primary";
}) {
  const { pending } = useFormStatus();
  const classes = [
    className,
    variant === "primary" ? "primary" : "",
    pending ? "is-loading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button aria-busy={pending} className={classes} disabled={pending} type="submit">
      {pending ? (
        <>
          <LoadingSpinner />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

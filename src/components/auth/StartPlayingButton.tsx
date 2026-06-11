"use client";

import { useActionState } from "react";

import { bootstrapPlayerSession } from "@/app/auth/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function StartPlayingButton({
  children = "Neu spielen",
}: {
  children?: string;
}) {
  const [state, formAction] = useActionState(bootstrapPlayerSession, {
    error: null,
  });

  return (
    <div>
      <form action={formAction}>
        <SubmitButton pendingLabel="Wird vorbereitet..." variant="primary">
          {children}
        </SubmitButton>
      </form>
      {state.error ? (
        <p className="muted" role="alert" style={{ marginTop: 12 }}>
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action="/auth/signout"
      method="post"
      onSubmit={() => {
        setPending(true);
      }}
    >
      <button
        aria-busy={pending}
        className={`button${compact ? " button-compact" : ""}${pending ? " is-loading" : ""}`}
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            <LoadingSpinner />
            Logout...
          </>
        ) : (
          "Logout"
        )}
      </button>
    </form>
  );
}

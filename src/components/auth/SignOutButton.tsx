"use client";

import { useState } from "react";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function SignOutButton() {
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
        className={`button${pending ? " is-loading" : ""}`}
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            <LoadingSpinner />
            Wird abgemeldet...
          </>
        ) : (
          "Abmelden"
        )}
      </button>
    </form>
  );
}

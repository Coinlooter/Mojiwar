"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signalNavigationStart } from "@/lib/ui/navigation-feedback";

export function StartPlayingButton({
  children = "Neu spielen",
}: {
  children?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busy = isPending || isStarting;

  async function handleStart() {
    setErrorMessage(null);
    setIsStarting(true);
    signalNavigationStart();

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const { error } = await supabase.auth.signInAnonymously();

        if (error) {
          setErrorMessage(
            "Sofort spielen ist noch nicht aktiv. Bitte Anonymous Sign-ins in Supabase Auth aktivieren.",
          );
          setIsStarting(false);
          return;
        }
      }

      startTransition(() => {
        setIsStarting(false);
        router.refresh();
        router.push("/dashboard");
      });
    } catch {
      setErrorMessage("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      setIsStarting(false);
    }
  }

  return (
    <div>
      <button
        aria-busy={busy}
        className={`button primary${busy ? " is-loading" : ""}`}
        disabled={busy}
        onClick={handleStart}
        type="button"
      >
        {busy ? (
          <>
            <LoadingSpinner />
            Wird vorbereitet...
          </>
        ) : (
          children
        )}
      </button>
      {errorMessage ? (
        <p className="muted" role="alert" style={{ marginTop: 12 }}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

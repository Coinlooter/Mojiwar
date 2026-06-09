"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function StartPlayingButton({
  children = "Sofort spielen",
}: {
  children?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStart() {
    setErrorMessage(null);
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
        return;
      }
    }

    startTransition(() => {
      router.refresh();
      router.push("/dashboard");
    });
  }

  return (
    <div>
      <button
        className="button primary"
        disabled={isPending}
        onClick={handleStart}
        type="button"
      >
        {isPending ? "Wird vorbereitet..." : children}
      </button>
      {errorMessage ? (
        <p className="muted" role="alert" style={{ marginTop: 12 }}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

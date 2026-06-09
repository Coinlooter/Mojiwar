import { redirect } from "next/navigation";

import { createCharacter } from "./actions";
import { getVerifiedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "Bitte waehle ein Emoji und einen Namen mit mindestens 2 Zeichen.",
  profile: "Profil konnte nicht gespeichert werden. Bitte versuche es erneut.",
  character: "Emoji-Charakter konnte nicht erstellt werden. Bitte versuche es erneut.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user } = await getVerifiedUser();

  if (!user) {
    redirect("/");
  }

  const { data: existingCharacter } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingCharacter) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <section className="hero">
        <div>
          <p className="eyebrow">Erster Start</p>
          <h1>Waehle dein Emoji und gib ihm einen Namen.</h1>
          <p className="lead">
            Dein Fortschritt wird ab jetzt mit diesem Geraet verknuepft. Spaeter
            kannst du den Account mit einer Eltern-E-Mail sichern.
          </p>
        </div>

        <form action={createCharacter} className="panel battle-card form-card">
          <label className="field-label" htmlFor="emoji">
            Dein Emoji
          </label>
          <input
            autoComplete="off"
            className="text-input emoji-input"
            defaultValue="🦊"
            id="emoji"
            maxLength={16}
            name="emoji"
            required
          />

          <label className="field-label" htmlFor="name">
            Name deines Emojis
          </label>
          <input
            autoComplete="nickname"
            className="text-input"
            id="name"
            maxLength={32}
            minLength={2}
            name="name"
            placeholder="z. B. Foxy"
            required
          />

          {errorMessage ? (
            <p className="muted" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button className="button primary" type="submit">
            Charakter erstellen
          </button>
        </form>
    </section>
  );
}

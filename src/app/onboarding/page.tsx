import { redirect } from "next/navigation";

import { EmojiPicker } from "@/components/onboarding/EmojiPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
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
          Such dir einen Helden aus und gib ihm einen coolen Namen. Im Dashboard
          bekommst du danach deinen Login-Code.
        </p>
      </div>

      <form action={createCharacter} className="panel battle-card form-card">
        <EmojiPicker />

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

        <SubmitButton pendingLabel="Held wird erstellt..." variant="primary">
          Charakter erstellen
        </SubmitButton>
      </form>
    </section>
  );
}

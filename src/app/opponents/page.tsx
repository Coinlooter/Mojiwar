import { challengeCharacter } from "@/app/battle/actions";
import { requireCharacter } from "@/lib/auth/require-character";
import { calculatePower } from "@/lib/game/calculate-power";
import { fetchCharacterLoadout, fetchCharacterLoadouts } from "@/lib/game/loadout";
import { findBestAutomaticOpponent } from "@/lib/game/matchmaking";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "Dieser Gegner konnte nicht herausgefordert werden.",
  self: "Du kannst dich nicht selbst herausfordern.",
  missing: "Der Gegner wurde nicht gefunden.",
  battle: "Der Kampf konnte gerade nicht gestartet werden. Versuche es erneut.",
};

export default async function OpponentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, character } = await requireCharacter();
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  const player = await fetchCharacterLoadout(supabase, character.id);

  if (!player) {
    return null;
  }

  const { data: opponentRows } = await supabase
    .from("characters")
    .select("id")
    .neq("user_id", character.user_id)
    .order("power", { ascending: true });

  const candidates = await fetchCharacterLoadouts(
    supabase,
    (opponentRows ?? []).map((row) => row.id),
  );

  const match = findBestAutomaticOpponent({ player, candidates });

  return (
    <>
      <section>
        <p className="eyebrow">Gegner suchen</p>
        <h1>Waehle einen Gegner fuer deinen naechsten Kampf.</h1>
        <p className="lead">
          Dein Emoji kaempft sofort. Der Gegner muss nicht online sein und sieht
          das Ergebnis spaeter in seiner Inbox.
        </p>
      </section>

      {errorMessage ? (
        <p className="muted" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {match ? (
        <section className="section panel battle-card">
          <p className="eyebrow">Passender Gegner</p>
          <h2>
            {match.opponent.emoji} {match.opponent.name}
          </h2>
          <p className="muted">
            Gegner-Staerke {match.opponentPower} · Level {match.opponent.level}
          </p>
          <form action={challengeCharacter}>
            <input
              name="defenderCharacterId"
              type="hidden"
              value={match.opponent.id}
            />
            <button className="button primary" type="submit">
              Herausfordern
            </button>
          </form>
        </section>
      ) : (
        <section className="section panel battle-card">
          <p className="muted">
            Gerade gibt es keinen passenden Gegner. Probiere es spaeter noch
            einmal.
          </p>
        </section>
      )}

      <section className="section feature-grid" aria-label="Alle Gegner">
        {candidates.map((candidate) => (
          <article className="feature-card" key={candidate.id}>
            <div className="emoji">{candidate.emoji}</div>
            <h3>{candidate.name}</h3>
            <p className="muted">
              Level {candidate.level} · Staerke {calculatePower(candidate)} ·{" "}
              {candidate.deck.length} Karten
            </p>
            <form action={challengeCharacter}>
              <input
                name="defenderCharacterId"
                type="hidden"
                value={candidate.id}
              />
              <button className="button" type="submit">
                Herausfordern
              </button>
            </form>
          </article>
        ))}
      </section>
    </>
  );
}

import { OpponentsBoard } from "@/components/opponents/OpponentsBoard";
import { requireCharacter } from "@/lib/auth/require-character";
import { calculatePower } from "@/lib/game/calculate-power";
import { fetchCharacterLoadout } from "@/lib/game/loadout";
import { resolveOpponentList } from "@/lib/game/opponent-selection";
import { getPowerRange } from "@/lib/game/matchmaking";
import {
  getSearchParamErrorMessage,
  OPPONENT_ERROR_MESSAGES,
} from "@/lib/ui/errors";

export const dynamic = "force-dynamic";

export default async function OpponentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, character } = await requireCharacter();
  const params = await searchParams;
  const errorMessage = getSearchParamErrorMessage(
    params.error,
    OPPONENT_ERROR_MESSAGES,
  );

  const player = await fetchCharacterLoadout(supabase, character.id);

  if (!player) {
    return (
      <div className="fight-page">
        <section className="panel battle-card">
          <p className="muted">
            Dein Held konnte nicht geladen werden. Versuche es erneut unter
            Dashboard.
          </p>
        </section>
      </div>
    );
  }

  const playerPower = calculatePower(player);
  const powerRange = getPowerRange(playerPower);
  const { opponents, fallbackHint, loadError } = await resolveOpponentList(
    supabase,
    player,
  );

  return (
    <OpponentsBoard
      fallbackHint={fallbackHint}
      initialErrorMessage={errorMessage ?? loadError}
      opponents={opponents}
      playerEmoji={player.emoji}
      playerPower={playerPower}
      powerRange={powerRange}
    />
  );
}

import { OpponentsBoard } from "@/components/opponents/OpponentsBoard";
import { requireCharacter } from "@/lib/auth/require-character";
import { fetchCharacterLoadout, fetchCharacterLoadouts } from "@/lib/game/loadout";
import { findBestAutomaticOpponent } from "@/lib/game/matchmaking";
import { fetchOpponentCharacterIds } from "@/lib/game/opponents";
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

  const [player, opponentIds] = await Promise.all([
    fetchCharacterLoadout(supabase, character.id),
    fetchOpponentCharacterIds(supabase, character.user_id),
  ]);

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

  const { allIds, botIds, playerIds, hasRealPlayers } = opponentIds;
  const candidates = await fetchCharacterLoadouts(supabase, allIds);
  const botCandidates = candidates.filter((candidate) => botIds.includes(candidate.id));
  const playerCandidates = candidates.filter((candidate) =>
    playerIds.includes(candidate.id),
  );

  const match = findBestAutomaticOpponent({ player, candidates });

  return (
    <OpponentsBoard
      botCandidates={botCandidates}
      hasRealPlayers={hasRealPlayers}
      initialErrorMessage={errorMessage}
      match={match}
      playerCandidates={playerCandidates}
      playerEmoji={player.emoji}
    />
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { LOAD_ERROR_MESSAGE } from "@/lib/ui/load-result";
import { calculatePower } from "./calculate-power";
import {
  fetchOpponentCharacterLoadouts,
} from "./loadout";
import {
  getPowerRange,
  LOW_LEVEL_WIDENED_MAX_LEVEL,
  rankOpponentsByProximity,
  rankOpponentsInPowerRange,
  WIDENED_POWER_MAX_TOLERANCE,
  WIDENED_POWER_MIN_TOLERANCE,
  type RankedOpponent,
} from "./matchmaking";
import {
  fetchBotCharacterIds,
  fetchOpponentCharacterIds,
} from "./opponents";
import type { CharacterLoadout } from "./types";

export type OpponentListResolution = {
  opponents: RankedOpponent[];
  fallbackHint: string | null;
  loadError: string | null;
};

export async function resolveOpponentList(
  supabase: SupabaseClient<Database>,
  player: CharacterLoadout,
): Promise<OpponentListResolution> {
  const playerPower = calculatePower(player);
  const powerRange = getPowerRange(playerPower);

  const idsResult = await fetchOpponentCharacterIds(supabase, {
    excludeCharacterId: player.id,
    minPower: powerRange.min,
    maxPower: powerRange.max,
  });

  if (!idsResult.ok) {
    return {
      opponents: [],
      fallbackHint: null,
      loadError: idsResult.message ?? LOAD_ERROR_MESSAGE,
    };
  }

  let candidates = await fetchOpponentCharacterLoadouts(idsResult.data);
  let opponents = rankOpponentsInPowerRange({ player, candidates });

  if (opponents.length > 0) {
    return { opponents, fallbackHint: null, loadError: null };
  }

  if (player.level <= LOW_LEVEL_WIDENED_MAX_LEVEL) {
    const wideRange = getPowerRange(playerPower, {
      minTolerance: WIDENED_POWER_MIN_TOLERANCE,
      maxTolerance: WIDENED_POWER_MAX_TOLERANCE,
    });
    const wideIdsResult = await fetchOpponentCharacterIds(supabase, {
      excludeCharacterId: player.id,
      minPower: wideRange.min,
      maxPower: wideRange.max,
    });

    if (wideIdsResult.ok) {
      candidates = await fetchOpponentCharacterLoadouts(wideIdsResult.data);
      opponents = rankOpponentsInPowerRange({
        player,
        candidates,
        minTolerance: WIDENED_POWER_MIN_TOLERANCE,
        maxTolerance: WIDENED_POWER_MAX_TOLERANCE,
      });

      if (opponents.length > 0) {
        return {
          opponents,
          fallbackHint:
            "Wir haben die Suche etwas erweitert, weil gerade wenige Gegner in deiner Stärkeklasse online sind.",
          loadError: null,
        };
      }
    }
  }

  const botIdsResult = await fetchBotCharacterIds(supabase);

  if (botIdsResult.ok) {
    candidates = await fetchOpponentCharacterLoadouts(botIdsResult.data);
    opponents = rankOpponentsByProximity({ player, candidates, limit: 5 });

    if (opponents.length > 0) {
      return {
        opponents,
        fallbackHint:
          "Übungsgegner werden angezeigt. Echte Spieler erscheinen wieder, sobald jemand in deiner Stärkeklasse verfügbar ist.",
        loadError: null,
      };
    }
  }

  return {
    opponents: [],
    fallbackHint: `Gerade ist niemand verfügbar. Deine Stärkeklasse liegt bei ${powerRange.min}–${powerRange.max}. Rüste dein Build aus oder versuche es später erneut.`,
    loadError: null,
  };
}

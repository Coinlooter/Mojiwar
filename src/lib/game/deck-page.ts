import type { SupabaseClient } from "@supabase/supabase-js";

import { MAX_DECK_SLOTS } from "@/lib/game/cards";
import { MAX_TALISMAN_SLOTS } from "@/lib/game/talismans";
import { mapCardRow, mapTalismanRow } from "@/lib/game/loadout";
import type {
  InventoryCardData,
  InventorySlotData,
  InventoryTalismanData,
  InventoryTalismanSlotData,
} from "@/lib/inventory/types";
import type { Database } from "@/lib/supabase/database.types";

export type DeckPageData = {
  slots: InventorySlotData[];
  collection: InventoryCardData[];
  unlockedSlotCount: number;
  talismanSlots: InventoryTalismanSlotData[];
  talismanCollection: InventoryTalismanData[];
};

export async function fetchDeckPageData(
  supabase: SupabaseClient<Database>,
  userId: string,
  characterId: string,
): Promise<DeckPageData> {
  const [
    { data: character },
    { data: ownedCards },
    { data: deckSlots },
    { data: ownedTalismans },
    { data: talismanSlots },
  ] = await Promise.all([
    supabase
      .from("characters")
      .select("unlocked_slot_count")
      .eq("id", characterId)
      .maybeSingle(),
    supabase
      .from("player_cards")
      .select("id, card_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("deck_slots")
      .select("slot_index, player_card_id")
      .eq("character_id", characterId)
      .order("slot_index", { ascending: true }),
    supabase
      .from("player_talismans")
      .select("id, talisman_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("talisman_slots")
      .select("slot_index, player_talisman_id")
      .eq("character_id", characterId)
      .order("slot_index", { ascending: true }),
  ]);

  const unlockedSlotCount = character?.unlocked_slot_count ?? 3;

  const cardIds = [...new Set((ownedCards ?? []).map((ownedCard) => ownedCard.card_id))];
  const talismanIds = [
    ...new Set((ownedTalismans ?? []).map((ownedTalisman) => ownedTalisman.talisman_id)),
  ];
  const [{ data: cardRows }, { data: talismanRows }] = await Promise.all([
    cardIds.length
      ? supabase.from("cards").select("*").in("id", cardIds)
      : Promise.resolve({ data: [] }),
    talismanIds.length
      ? supabase.from("talismans").select("*").in("id", talismanIds)
      : Promise.resolve({ data: [] }),
  ]);

  const cardsById = new Map((cardRows ?? []).map((card) => [card.id, mapCardRow(card)]));
  const talismansById = new Map(
    (talismanRows ?? []).map((talisman) => [talisman.id, mapTalismanRow(talisman)]),
  );
  const activeBySlot = new Map(
    (deckSlots ?? []).map((slot) => [slot.slot_index, slot.player_card_id]),
  );
  const activeTalismanBySlot = new Map(
    (talismanSlots ?? []).map((slot) => [slot.slot_index, slot.player_talisman_id]),
  );
  const activeCardIds = new Set(activeBySlot.values());
  const activeTalismanIds = new Set(activeTalismanBySlot.values());

  function toInventoryCard(playerCardId: string, cardId: string): InventoryCardData | null {
    const card = cardsById.get(cardId);

    if (!card) {
      return null;
    }

    return {
      playerCardId,
      emoji: card.emoji,
      name: card.name,
      rarity: card.rarity,
      description: card.description,
    };
  }

  const slots: InventorySlotData[] = Array.from({ length: MAX_DECK_SLOTS }, (_, slotIndex) => {
    const playerCardId = activeBySlot.get(slotIndex);
    const ownedCard = (ownedCards ?? []).find((entry) => entry.id === playerCardId);
    const unlocked = slotIndex < unlockedSlotCount;

    return {
      slotIndex,
      unlocked,
      card:
        unlocked && playerCardId && ownedCard
          ? toInventoryCard(playerCardId, ownedCard.card_id)
          : null,
    };
  });

  const collection: InventoryCardData[] = (ownedCards ?? []).flatMap((ownedCard) => {
    if (activeCardIds.has(ownedCard.id)) {
      return [];
    }

    const card = toInventoryCard(ownedCard.id, ownedCard.card_id);

    return card ? [card] : [];
  });

  function toInventoryTalisman(
    playerTalismanId: string,
    talismanId: string,
  ): InventoryTalismanData | null {
    const talisman = talismansById.get(talismanId);

    if (!talisman) {
      return null;
    }

    return {
      playerTalismanId,
      emoji: talisman.emoji,
      name: talisman.name,
      rarity: talisman.rarity,
      description: talisman.description,
    };
  }

  const talismanSlotList: InventoryTalismanSlotData[] = Array.from(
    { length: MAX_TALISMAN_SLOTS },
    (_, slotIndex) => {
      const playerTalismanId = activeTalismanBySlot.get(slotIndex);
      const ownedTalisman = (ownedTalismans ?? []).find(
        (entry) => entry.id === playerTalismanId,
      );

      return {
        slotIndex,
        talisman:
          playerTalismanId && ownedTalisman
            ? toInventoryTalisman(playerTalismanId, ownedTalisman.talisman_id)
            : null,
      };
    },
  );

  const talismanCollection: InventoryTalismanData[] = (ownedTalismans ?? []).flatMap(
    (ownedTalisman) => {
      if (activeTalismanIds.has(ownedTalisman.id)) {
        return [];
      }

      const talisman = toInventoryTalisman(ownedTalisman.id, ownedTalisman.talisman_id);

      return talisman ? [talisman] : [];
    },
  );

  return {
    slots,
    collection,
    unlockedSlotCount,
    talismanSlots: talismanSlotList,
    talismanCollection,
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";

import { MAX_DECK_SLOTS } from "@/lib/game/cards";
import { mapCardRow } from "@/lib/game/loadout";
import type { InventoryCardData, InventorySlotData } from "@/lib/inventory/types";
import type { Database } from "@/lib/supabase/database.types";

export type DeckPageData = {
  slots: InventorySlotData[];
  collection: InventoryCardData[];
  unlockedSlotCount: number;
};

export async function fetchDeckPageData(
  supabase: SupabaseClient<Database>,
  userId: string,
  characterId: string,
): Promise<DeckPageData> {
  const [{ data: character }, { data: ownedCards }, { data: deckSlots }] =
    await Promise.all([
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
    ]);

  const unlockedSlotCount = character?.unlocked_slot_count ?? 3;

  const cardIds = [...new Set((ownedCards ?? []).map((ownedCard) => ownedCard.card_id))];
  const { data: cardRows } = cardIds.length
    ? await supabase.from("cards").select("*").in("id", cardIds)
    : { data: [] };

  const cardsById = new Map((cardRows ?? []).map((card) => [card.id, mapCardRow(card)]));
  const activeBySlot = new Map(
    (deckSlots ?? []).map((slot) => [slot.slot_index, slot.player_card_id]),
  );
  const activeCardIds = new Set(activeBySlot.values());

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

  return { slots, collection, unlockedSlotCount };
}

import { InventoryBoard } from "@/components/inventory/InventoryBoard";
import { requireCharacter } from "@/lib/auth/require-character";
import { MAX_STARTER_DECK_SIZE } from "@/lib/game/cards";
import { mapCardRow } from "@/lib/game/loadout";
import type { DeckActionError } from "@/app/deck/actions";
import type { InventoryCardData, InventorySlotData } from "@/lib/inventory/types";

export const dynamic = "force-dynamic";

const errorCodes = new Set<DeckActionError>(["invalid", "card", "slot"]);

function isDeckActionError(value: string | undefined): value is DeckActionError {
  return value !== undefined && errorCodes.has(value as DeckActionError);
}

export default async function DeckPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user, character } = await requireCharacter();
  const params = await searchParams;
  const initialError = isDeckActionError(params.error) ? params.error : null;

  const [{ data: ownedCards }, { data: deckSlots }] = await Promise.all([
    supabase
      .from("player_cards")
      .select("id, card_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("deck_slots")
      .select("slot_index, player_card_id")
      .eq("character_id", character.id)
      .order("slot_index", { ascending: true }),
  ]);

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

  const slots: InventorySlotData[] = Array.from(
    { length: MAX_STARTER_DECK_SIZE },
    (_, slotIndex) => {
      const playerCardId = activeBySlot.get(slotIndex);
      const ownedCard = (ownedCards ?? []).find((entry) => entry.id === playerCardId);

      return {
        slotIndex,
        card:
          playerCardId && ownedCard
            ? toInventoryCard(playerCardId, ownedCard.card_id)
            : null,
      };
    },
  );

  const collection: InventoryCardData[] = (ownedCards ?? []).flatMap((ownedCard) => {
    if (activeCardIds.has(ownedCard.id)) {
      return [];
    }

    const card = toInventoryCard(ownedCard.id, ownedCard.card_id);

    return card ? [card] : [];
  });

  return (
    <>
      <section>
        <p className="eyebrow">Inventar</p>
        <h1>{MAX_STARTER_DECK_SIZE} Karten entscheiden deinen Build.</h1>
        <p className="lead">
          Ziehe Karten aus deinem Inventar in die Slots. Staerkere Kombos machen
          dein Emoji im Kampf gefaehrlicher.
        </p>
      </section>

      <InventoryBoard
        collection={collection}
        initialError={initialError}
        slots={slots}
      />
    </>
  );
}

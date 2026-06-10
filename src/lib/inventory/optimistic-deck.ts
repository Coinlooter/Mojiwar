import type { InventoryCardData, InventorySlotData } from "@/lib/inventory/types";

export type InventoryDeckState = {
  slots: InventorySlotData[];
  collection: InventoryCardData[];
};

function findCardInSlots(
  slots: InventorySlotData[],
  playerCardId: string,
): { slotIndex: number; card: InventoryCardData } | null {
  for (const slot of slots) {
    if (slot.card?.playerCardId === playerCardId) {
      return { slotIndex: slot.slotIndex, card: slot.card };
    }
  }

  return null;
}

function setSlotCard(
  slots: InventorySlotData[],
  slotIndex: number,
  card: InventoryCardData | null,
): InventorySlotData[] {
  return slots.map((slot) =>
    slot.slotIndex === slotIndex ? { ...slot, card } : slot,
  );
}

export function equipCardOptimistically(
  state: InventoryDeckState,
  playerCardId: string,
  targetSlotIndex: number,
): InventoryDeckState | null {
  const fromCollection = state.collection.find(
    (card) => card.playerCardId === playerCardId,
  );
  const fromSlot = findCardInSlots(state.slots, playerCardId);
  const movingCard = fromCollection ?? fromSlot?.card;

  if (!movingCard) {
    return null;
  }

  const targetSlot = state.slots.find((slot) => slot.slotIndex === targetSlotIndex);

  if (!targetSlot) {
    return null;
  }

  const displacedCard = targetSlot.card;
  let nextSlots = setSlotCard(state.slots, targetSlotIndex, movingCard);

  if (fromSlot && fromSlot.slotIndex !== targetSlotIndex) {
    nextSlots = setSlotCard(nextSlots, fromSlot.slotIndex, null);
  }

  let nextCollection = state.collection.filter(
    (card) => card.playerCardId !== playerCardId,
  );

  if (displacedCard && displacedCard.playerCardId !== playerCardId) {
    nextCollection = [...nextCollection, displacedCard];
  }

  return {
    slots: nextSlots,
    collection: nextCollection,
  };
}

export function unequipCardOptimistically(
  state: InventoryDeckState,
  slotIndex: number,
): InventoryDeckState | null {
  const slot = state.slots.find((entry) => entry.slotIndex === slotIndex);

  if (!slot?.card) {
    return null;
  }

  return {
    slots: setSlotCard(state.slots, slotIndex, null),
    collection: [...state.collection, slot.card],
  };
}

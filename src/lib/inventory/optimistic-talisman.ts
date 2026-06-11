import type {
  InventoryTalismanData,
  InventoryTalismanSlotData,
} from "@/lib/inventory/types";

export type InventoryTalismanState = {
  slots: InventoryTalismanSlotData[];
  collection: InventoryTalismanData[];
};

function setSlotTalisman(
  slots: InventoryTalismanSlotData[],
  slotIndex: number,
  talisman: InventoryTalismanData | null,
) {
  return slots.map((slot) =>
    slot.slotIndex === slotIndex ? { ...slot, talisman } : slot,
  );
}

export function equipTalismanOptimistically(
  state: InventoryTalismanState,
  playerTalismanId: string,
  targetSlotIndex: number,
): InventoryTalismanState | null {
  const movingTalisman = state.collection.find(
    (entry) => entry.playerTalismanId === playerTalismanId,
  );
  const targetSlot = state.slots.find((slot) => slot.slotIndex === targetSlotIndex);

  if (!movingTalisman || !targetSlot) {
    return null;
  }

  const displacedTalisman = targetSlot.talisman;
  const nextSlots = setSlotTalisman(state.slots, targetSlotIndex, movingTalisman);
  const nextCollection = state.collection.filter(
    (entry) => entry.playerTalismanId !== playerTalismanId,
  );

  if (displacedTalisman) {
    nextCollection.push(displacedTalisman);
  }

  return {
    slots: nextSlots,
    collection: nextCollection,
  };
}

export function unequipTalismanOptimistically(
  state: InventoryTalismanState,
  slotIndex: number,
): InventoryTalismanState | null {
  const slot = state.slots.find((entry) => entry.slotIndex === slotIndex);

  if (!slot?.talisman) {
    return null;
  }

  return {
    slots: setSlotTalisman(state.slots, slotIndex, null),
    collection: [...state.collection, slot.talisman],
  };
}

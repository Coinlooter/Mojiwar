import { describe, expect, it } from "vitest";

import {
  equipCardOptimistically,
  unequipCardOptimistically,
  type InventoryDeckState,
} from "./optimistic-deck";

const cardA = {
  playerCardId: "a0000000-0000-4000-8000-000000000001",
  emoji: "🔥",
  name: "Funkenhieb",
  rarity: "common" as const,
  description: "+4 Angriff.",
};

const cardB = {
  playerCardId: "b0000000-0000-4000-8000-000000000002",
  emoji: "🛡️",
  name: "Mini-Schild",
  rarity: "common" as const,
  description: "+3 Verteidigung.",
};

const cardC = {
  playerCardId: "c0000000-0000-4000-8000-000000000003",
  emoji: "💚",
  name: "Grünes Herz",
  rarity: "common" as const,
  description: "+18 Leben.",
};

function createState(): InventoryDeckState {
  return {
    slots: [
      { slotIndex: 0, unlocked: true, card: cardA },
      { slotIndex: 1, unlocked: true, card: null },
      { slotIndex: 2, unlocked: true, card: cardB },
    ],
    collection: [cardC],
  };
}

describe("equipCardOptimistically", () => {
  it("moves a collection card into an empty slot", () => {
    const next = equipCardOptimistically(createState(), cardC.playerCardId, 1);

    expect(next?.slots[1]?.card?.playerCardId).toBe(cardC.playerCardId);
    expect(next?.collection).toHaveLength(0);
  });

  it("swaps a collection card into an occupied slot and returns displaced card", () => {
    const next = equipCardOptimistically(createState(), cardC.playerCardId, 0);

    expect(next?.slots[0]?.card?.playerCardId).toBe(cardC.playerCardId);
    expect(next?.collection.map((card) => card.playerCardId)).toEqual([
      cardA.playerCardId,
    ]);
  });

  it("moves a card from one slot to another and keeps displaced card in collection", () => {
    const next = equipCardOptimistically(createState(), cardA.playerCardId, 2);

    expect(next?.slots[0]?.card).toBeNull();
    expect(next?.slots[2]?.card?.playerCardId).toBe(cardA.playerCardId);
    expect(next?.collection.map((card) => card.playerCardId)).toEqual([
      cardC.playerCardId,
      cardB.playerCardId,
    ]);
  });

  it("rejects equipping into a locked slot", () => {
    const state: InventoryDeckState = {
      slots: [
        { slotIndex: 0, unlocked: true, card: null },
        { slotIndex: 1, unlocked: false, card: null },
      ],
      collection: [cardC],
    };

    expect(equipCardOptimistically(state, cardC.playerCardId, 1)).toBeNull();
  });
});

describe("unequipCardOptimistically", () => {
  it("moves a slotted card back to the collection", () => {
    const next = unequipCardOptimistically(createState(), 0);

    expect(next?.slots[0]?.card).toBeNull();
    expect(next?.collection.map((card) => card.playerCardId)).toEqual([
      cardC.playerCardId,
      cardA.playerCardId,
    ]);
  });
});

import { describe, expect, it } from "vitest";

import {
  equipTalismanOptimistically,
  unequipTalismanOptimistically,
} from "./optimistic-talisman";

const talismanA = {
  playerTalismanId: "talisman-a",
  emoji: "🧿",
  name: "Moos-Amulett",
  rarity: "common" as const,
  description: "+2 Verteidigung",
};

const talismanB = {
  playerTalismanId: "talisman-b",
  emoji: "🔮",
  name: "Wärme-Talisman",
  rarity: "common" as const,
  description: "+12 Leben",
};

describe("optimistic talisman updates", () => {
  it("moves a talisman from collection into the slot", () => {
    const next = equipTalismanOptimistically(
      {
        slots: [{ slotIndex: 0, talisman: null }],
        collection: [talismanA],
      },
      "talisman-a",
      0,
    );

    expect(next?.slots[0]?.talisman?.playerTalismanId).toBe("talisman-a");
    expect(next?.collection).toHaveLength(0);
  });

  it("swaps talismans when the slot is occupied", () => {
    const next = equipTalismanOptimistically(
      {
        slots: [{ slotIndex: 0, talisman: talismanA }],
        collection: [talismanB],
      },
      "talisman-b",
      0,
    );

    expect(next?.slots[0]?.talisman?.playerTalismanId).toBe("talisman-b");
    expect(next?.collection.map((entry) => entry.playerTalismanId)).toEqual([
      "talisman-a",
    ]);
  });

  it("moves an equipped talisman back to the collection", () => {
    const next = unequipTalismanOptimistically(
      {
        slots: [{ slotIndex: 0, talisman: talismanA }],
        collection: [],
      },
      0,
    );

    expect(next?.slots[0]?.talisman).toBeNull();
    expect(next?.collection).toHaveLength(1);
  });
});

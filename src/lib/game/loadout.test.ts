import { describe, expect, it } from "vitest";

import { buildCharacterLoadout, mapCardRow, mapCharacterRowToBaseStats } from "./loadout";

describe("loadout mapper", () => {
  it("mappt Charakter- und Kartenzeilen in ein Loadout", () => {
    const character = {
      id: "char-1",
      user_id: "user-1",
      emoji: "🦊",
      name: "Foxy",
      level: 2,
      xp: 40,
      base_hp: 100,
      base_attack: 14,
      base_defense: 6,
      base_speed: 10,
      base_crit_chance: 0.05,
      power: 200,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    };

    const card = mapCardRow({
      id: "ember-punch",
      name: "Funkenhieb",
      emoji: "🔥",
      rarity: "common",
      effect_type: "bonus_attack",
      effect_value: 4,
      description: "+4 Angriff.",
      created_at: "2026-01-01T00:00:00.000Z",
    });

    const loadout = buildCharacterLoadout(character, [card]);

    expect(mapCharacterRowToBaseStats(character).attack).toBe(14);
    expect(loadout.deck).toHaveLength(1);
    expect(loadout.deck[0]?.id).toBe("ember-punch");
  });
});

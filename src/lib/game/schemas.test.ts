import { describe, expect, it } from "vitest";

import { createCharacterSchema } from "./schemas";

describe("createCharacterSchema", () => {
  it("akzeptiert ein Starter-Emoji aus der Auswahl", () => {
    const result = createCharacterSchema.safeParse({
      emoji: "🦄",
      name: "Luna",
    });

    expect(result.success).toBe(true);
  });

  it("lehnt Emojis ausserhalb der Starter-Auswahl ab", () => {
    const result = createCharacterSchema.safeParse({
      emoji: "🚀",
      name: "Rocket",
    });

    expect(result.success).toBe(false);
  });
});

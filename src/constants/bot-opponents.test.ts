import { describe, expect, it } from "vitest";

import { BOT_OPPONENTS } from "./bot-opponents";

describe("bot opponents", () => {
  it("definiert zehn Übungsgegner mit steigender Stärke", () => {
    expect(BOT_OPPONENTS).toHaveLength(10);

    const powers = BOT_OPPONENTS.map((bot) => bot.power);

    for (let index = 1; index < powers.length; index += 1) {
      expect(powers[index]).toBeGreaterThan(powers[index - 1] ?? 0);
    }
  });
});

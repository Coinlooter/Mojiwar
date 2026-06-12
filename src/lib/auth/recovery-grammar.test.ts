import { describe, expect, it } from "vitest";

import {
  getColorPhraseForAnimal,
  resolveColorSlugFromPhrase,
} from "./recovery-grammar";

describe("recovery grammar", () => {
  it("declines colors by animal gender", () => {
    expect(getColorPhraseForAnimal("goldener", "m")).toBe("goldener");
    expect(getColorPhraseForAnimal("goldener", "f")).toBe("goldene");
    expect(getColorPhraseForAnimal("goldener", "n")).toBe("goldenes");
  });

  it("keeps indeclinable colors unchanged", () => {
    expect(getColorPhraseForAnimal("lila", "n")).toBe("lila");
    expect(resolveColorSlugFromPhrase("lila")).toBe("lila");
  });

  it("resolves declined color phrases back to canonical slugs", () => {
    expect(resolveColorSlugFromPhrase("goldenes")).toBe("goldener");
    expect(resolveColorSlugFromPhrase("goldene")).toBe("goldener");
    expect(resolveColorSlugFromPhrase("goldener")).toBe("goldener");
  });
});

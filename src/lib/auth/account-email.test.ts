import { describe, expect, it } from "vitest";

import {
  getDisplayEmail,
  hasSecuredEmailAccount,
  isInternalRecoveryEmail,
  usesLoginCodeAccount,
} from "./account-email";

describe("account email helpers", () => {
  it("detects internal recovery emails", () => {
    expect(
      isInternalRecoveryEmail(
        "player+fa07bbc2725c4025bdae028d25ecaa65@recovery.emojitsu.app",
      ),
    ).toBe(true);
    expect(getDisplayEmail("spieler@beispiel.de")).toBe("spieler@beispiel.de");
    expect(
      getDisplayEmail(
        "player+fa07bbc2725c4025bdae028d25ecaa65@recovery.emojitsu.app",
      ),
    ).toBeNull();
  });

  it("treats internal recovery emails as login-code accounts", () => {
    const internalEmail =
      "player+fa07bbc2725c4025bdae028d25ecaa65@recovery.emojitsu.app";

    expect(
      usesLoginCodeAccount({ isAnonymous: false, email: internalEmail }),
    ).toBe(true);
    expect(
      hasSecuredEmailAccount({ isAnonymous: false, email: internalEmail }),
    ).toBe(false);
    expect(
      hasSecuredEmailAccount({
        isAnonymous: false,
        email: "spieler@beispiel.de",
      }),
    ).toBe(true);
  });
});

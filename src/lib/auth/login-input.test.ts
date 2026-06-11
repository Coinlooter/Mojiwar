import { describe, expect, it } from "vitest";

import { parseLoginInput } from "./login-input";

describe("parseLoginInput", () => {
  it("erkennt einen kombinierten Login-Code", () => {
    expect(parseLoginInput("blauerelefant65")).toEqual({
      kind: "recovery-code",
      parts: {
        colorSlug: "blauer",
        animalSlug: "elefant",
        numberSuffix: "65",
      },
    });
  });

  it("erkennt eine gültige E-Mail-Adresse", () => {
    expect(parseLoginInput("spieler@beispiel.de")).toEqual({
      kind: "email",
      email: "spieler@beispiel.de",
    });
  });

  it("lehnt interne Recovery-E-Mails ab", () => {
    expect(
      parseLoginInput("player+abc@recovery.emojitsu.app"),
    ).toBeNull();
  });

  it("lehnt ungültige Eingaben ab", () => {
    expect(parseLoginInput("")).toBeNull();
    expect(parseLoginInput("kein-gueltiger-code")).toBeNull();
    expect(parseLoginInput("keine-email@")).toBeNull();
  });
});

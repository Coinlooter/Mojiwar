import { describe, expect, it } from "vitest";

import pkg from "../../package.json";
import { CHANGELOG_VERSIONS } from "./changelog";

describe("changelog", () => {
  it("listet die aktuelle package.json-Version als neuesten Eintrag", () => {
    expect(CHANGELOG_VERSIONS[0]?.version).toBe(pkg.version);
  });

  it("enthaelt fuer jede Version mindestens eine Aenderung", () => {
    for (const entry of CHANGELOG_VERSIONS) {
      expect(entry.changes.length).toBeGreaterThan(0);
    }
  });
});

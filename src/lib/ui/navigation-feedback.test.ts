import { describe, expect, it } from "vitest";

import { getRoutePath } from "./navigation-feedback";

describe("getRoutePath", () => {
  it("returns the pathname without query or hash", () => {
    expect(getRoutePath("/dashboard")).toBe("/dashboard");
    expect(getRoutePath("/dashboard?tab=deck")).toBe("/dashboard");
    expect(getRoutePath("/dashboard#account")).toBe("/dashboard");
  });

  it("normalizes empty paths to root", () => {
    expect(getRoutePath("")).toBe("/");
    expect(getRoutePath("?next=/dashboard")).toBe("/");
  });
});

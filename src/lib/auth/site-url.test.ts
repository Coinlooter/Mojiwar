import { afterEach, describe, expect, it } from "vitest";

import { getAuthConfirmUrl, getSiteUrl } from "./site-url";

describe("getSiteUrl", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("bevorzugt NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://emojitsu.vercel.app/";
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

    expect(getSiteUrl()).toBe("https://emojitsu.vercel.app");
  });

  it("nutzt die Vercel-Produktionsdomain als Fallback", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "emojitsu.vercel.app";

    expect(getSiteUrl()).toBe("https://emojitsu.vercel.app");
  });

  it("baut die Auth-Bestätigungs-URL mit next-Parameter", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://emojitsu.vercel.app";

    expect(getAuthConfirmUrl("/dashboard")).toBe(
      "https://emojitsu.vercel.app/auth/confirm?next=%2Fdashboard",
    );
  });
});

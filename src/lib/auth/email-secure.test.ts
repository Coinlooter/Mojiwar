import { describe, expect, it } from "vitest";

import { mapEmailSecureError } from "./email-secure";

describe("mapEmailSecureError", () => {
  it("erkennt bereits vergebene E-Mail-Adressen", () => {
    expect(
      mapEmailSecureError({
        message: "A user with this email address has already been registered",
        code: "email_exists",
      }),
    ).toBe("email-in-use");
  });

  it("erkennt E-Mail-Rate-Limits", () => {
    expect(
      mapEmailSecureError({
        message: "email rate limit exceeded",
        code: "over_email_send_rate_limit",
      }),
    ).toBe("email-rate-limit");
  });
});

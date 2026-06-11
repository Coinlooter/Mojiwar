export type EmailSecureError =
  | "invalid-email"
  | "email-failed"
  | "email-in-use"
  | "email-rate-limit"
  | "email-already-secured";

type EmailSecureSource = {
  code?: string | null;
  message?: string | null;
} | null;

export function mapEmailSecureError(error: EmailSecureSource): EmailSecureError {
  if (!error) {
    return "email-failed";
  }

  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("already been registered")
  ) {
    return "email-in-use";
  }

  if (
    code === "over_email_send_rate_limit" ||
    message.includes("rate limit")
  ) {
    return "email-rate-limit";
  }

  return "email-failed";
}

import type { Route } from "next";
import { redirect } from "next/navigation";

export default function SecureProgressRedirectPage() {
  redirect("/dashboard" as Route);
}

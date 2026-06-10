import type { Route } from "next";
import { redirect } from "next/navigation";

export default function LoadProgressRedirectPage() {
  redirect("/login" as Route);
}

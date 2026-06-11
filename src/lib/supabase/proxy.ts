import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseBrowserEnv } from "./env";
import type { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseBrowserEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = next.startsWith("/") ? next : `/${next}`;
      redirectUrl.search = "";
      const redirectResponse = NextResponse.redirect(redirectUrl);

      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });

      return redirectResponse;
    }
  }

  await supabase.auth.getClaims();

  return supabaseResponse;
}

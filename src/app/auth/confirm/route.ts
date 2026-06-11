import type { EmailOtpType } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { resolvePostAuthPath } from "@/lib/auth/post-auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildRedirectUrl(request: NextRequest, next: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = next.startsWith("/") ? next : `/${next}`;
  redirectUrl.search = "";
  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  const supabase = await createSupabaseServerClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      revalidatePath("/", "layout");
      const next = await resolvePostAuthPath(
        supabase,
        data.user.id,
        requestedNext,
      );
      return NextResponse.redirect(buildRedirectUrl(request, next));
    }
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error && data.user) {
      revalidatePath("/", "layout");
      const next = await resolvePostAuthPath(
        supabase,
        data.user.id,
        requestedNext,
      );
      return NextResponse.redirect(buildRedirectUrl(request, next));
    }
  }

  return NextResponse.redirect(
    new URL("/dashboard?login-error=email-failed", request.url),
  );
}

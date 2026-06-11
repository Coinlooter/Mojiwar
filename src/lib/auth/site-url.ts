function normalizeSiteUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeSiteUrl(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  if (process.env.VERCEL_URL) {
    return normalizeSiteUrl(`https://${process.env.VERCEL_URL}`);
  }

  return "http://localhost:3000";
}

export function getAuthConfirmUrl(next = "/dashboard") {
  const nextPath = next.startsWith("/") ? next : `/${next}`;

  return `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(nextPath)}`;
}

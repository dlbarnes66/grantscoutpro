import { headers } from "next/headers";

/**
 * The public base URL of the app, used for Stripe return URLs and links.
 * Uses APP_URL / NEXT_PUBLIC_APP_URL when set to a full http(s) URL; otherwise
 * falls back to the address the request actually came in on. Stripe rejects a
 * return URL without a scheme ("Not a valid URL"), which is what happened when
 * neither variable was set in production.
 */
export function resolveAppUrl(
  env: { APP_URL?: string; NEXT_PUBLIC_APP_URL?: string },
  host: string | null,
  proto: string | null
): string {
  const configured = (env.APP_URL || env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");
  if (/^https?:\/\/[^/\s]+/i.test(configured)) return configured;
  if (host) {
    const scheme = proto || (/^(localhost|127\.0\.0\.1)/.test(host) ? "http" : "https");
    return `${scheme}://${host}`;
  }
  return "https://www.grantscoutpro.com";
}

export async function getAppUrl(): Promise<string> {
  const h = await headers();
  return resolveAppUrl({ APP_URL: process.env.APP_URL, NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL }, h.get("x-forwarded-host") || h.get("host"), h.get("x-forwarded-proto"));
}

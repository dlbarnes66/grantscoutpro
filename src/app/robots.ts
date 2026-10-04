import type { MetadataRoute } from "next";

const siteUrl = "https://www.grantscoutpro.com";

// Only the public marketing/legal pages are opened up to crawlers. Everything
// else in src/app (workspace tools, admin, onboarding, in-app features like
// budget/search/grants/etc.) sits behind Clerk auth and has no content worth
// indexing unauthenticated, so it's kept out of the crawl rather than left to
// redirect crawlers back to /sign-in.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/features", "/about", "/integrations", "/privacy", "/terms", "/refund", "/sign-in", "/sign-up"],
      disallow: ["/api/", "/workspace", "/admin", "/superadmin", "/settings", "/onboarding"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

export async function getFirecrawl() {
  const { FirecrawlApp } = await import("@mendable/firecrawl-js");

  return new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY!,
  });
}

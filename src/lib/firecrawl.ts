// lib/firecrawl.ts

export async function getFirecrawl() {
  const { Firecrawl } = await import("@mendable/firecrawl-js");

  return new Firecrawl({
    apiKey: process.env.FIRECRAWL_API_KEY!,
  });
}

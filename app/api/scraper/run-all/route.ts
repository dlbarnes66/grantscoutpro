import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function call(path: string, body: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return await res.json();
}

export async function POST(req: Request) {
  try {
    const { sources } = await req.json();

    if (!sources || !Array.isArray(sources)) {
      return NextResponse.json({ error: "Missing sources array" }, { status: 400 });
    }

    const results = [];

    for (const src of sources) {
      if (src.type === "json") {
        results.push(await call("/api/scraper/json", { url: src.url }));
      }

      if (src.type === "rss") {
        results.push(await call("/api/scraper/rss", { url: src.url }));
      }

      if (src.type === "html") {
        results.push(
          await call("/api/scraper/html", {
            url: src.url,
            selectors: src.selectors,
          })
        );
      }
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Multi-source scraper error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { firecrawl } from "@/lib/firecrawl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url, options } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Missing url" },
        { status: 400 }
      );
    }

    const ingestOptions = options || {};

    // FirecrawlApp does NOT support ingest(), so we use crawl()
    const result = await firecrawl.crawl({
      url,
      ...ingestOptions,
    });

    if (!result || !result.data) {
      return NextResponse.json(
        { error: "Failed to ingest content" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Firecrawl ingest error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

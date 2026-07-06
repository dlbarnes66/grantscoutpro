import { NextResponse } from "next/server";
import { firecrawl } from "@/lib/firecrawl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Missing url" },
        { status: 400 }
      );
    }

    // Old Firecrawl SDK: crawl(url: string) returns { data: Document[] }
    const result = await firecrawl.crawl(url);

    if (!result || !result.data) {
      return NextResponse.json(
        { error: "Failed to fetch metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data, // The ONLY safe field your SDK provides
    });
  } catch (err: any) {
    console.error("Firecrawl metadata error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

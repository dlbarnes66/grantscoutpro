import { NextResponse } from "next/server";
import { firecrawl } from "@/lib/firecrawl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Missing query" },
        { status: 400 }
      );
    }

    // Old Firecrawl SDK: search(query) returns a single SearchData object
    const result = await firecrawl.search(query);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to perform Firecrawl search" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result, // The ONLY safe field your SDK provides
    });
  } catch (err: any) {
    console.error("Firecrawl search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getFirecrawl } from "@/lib/firecrawl";

export async function POST(req: Request) {
  try {
    const { url, extractionFormat } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Missing url" },
        { status: 400 }
      );
    }

    // Load Firecrawl dynamically (build‑safe)
    const firecrawl = await getFirecrawl();

    const result = await firecrawl.extract({
      urls: [url],
      prompt: extractionFormat || "Extract structured content",
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Firecrawl extract error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

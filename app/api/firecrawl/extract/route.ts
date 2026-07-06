import { NextResponse } from "next/server";
import { firecrawl } from "@/lib/firecrawl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url, extractionFormat } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Missing url" },
        { status: 400 }
      );
    }

    // Use extractionFormat as a prompt instead
    const result = await firecrawl.extract({
      urls: [url],
      prompt: extractionFormat || "Extract structured content", // FIXED
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Firecrawl extract error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

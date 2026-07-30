import { NextResponse } from "next/server";
import { getFirecrawl } from "@/lib/firecrawl";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await getFirecrawl(); // ✅ await the client

    const result = await client.ingest(body);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Firecrawl ingest failed" },
      { status: 500 }
    );
  }
}

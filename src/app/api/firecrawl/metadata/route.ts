import { NextResponse } from "next/server";
import { getFirecrawl } from "@/lib/firecrawl";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await getFirecrawl(); // ✅ await

    const result = await client.metadata(body);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Firecrawl metadata failed" },
      { status: 500 }
    );
  }
}

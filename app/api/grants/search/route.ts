import { NextResponse } from "next/server";
import { searchGrants } from "@/lib/grants/search/searchGrants";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const results = await searchGrants({
      query: body.query || "",
      filters: body.filters || {},
      workspaceId: body.workspaceId,
      tier: body.tier, // "FEDERAL_ONLY", "FEDERAL_STATE", "PRO", "ENTERPRISE"
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Grant search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

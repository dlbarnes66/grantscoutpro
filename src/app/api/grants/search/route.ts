export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { searchGrants } from "@/lib/grants/search/searchGrants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const results = await searchGrants({
      query: body.query || "",
      filters: body.filters || {},
      workspaceId: body.workspaceId,
      tier: body.tier, // "FEDERAL_ONLY", "FEDERAL_STATE", "PRO", "ENTERPRISE"
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Grant search error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

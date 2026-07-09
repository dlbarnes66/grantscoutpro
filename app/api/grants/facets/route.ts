import { NextResponse } from "next/server";
import { getGrantFacets } from "@/lib/grants/facets/getGrantFacets";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const facets = await getGrantFacets({
      workspaceId: body.workspaceId,
      tier: body.tier, // "FEDERAL_ONLY", "FEDERAL_STATE", "PRO", "ENTERPRISE"
    });

    return NextResponse.json(facets);
  } catch (error: any) {
    console.error("Facet error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

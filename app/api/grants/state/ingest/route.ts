import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchStateGrants } from "@/lib/grants/state/fetchStateGrants";
import { normalizeStateGrant } from "@/lib/grants/state/normalizeStateGrant";

export async function POST() {
  try {
    const rawGrants = await fetchStateGrants();
    const normalized = rawGrants.map((g: any) => normalizeStateGrant(g));

    for (const grant of normalized) {
      await prisma.grant.upsert({
        where: {
          id: grant.raw?.id || grant.title,
        },
        update: grant,
        create: {
          id: grant.raw?.id || grant.title,
          ...grant,
        },
      });
    }

    return NextResponse.json({
      count: normalized.length,
      status: "State grants ingested successfully",
    });
  } catch (error: any) {
    console.error("State ingestion error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

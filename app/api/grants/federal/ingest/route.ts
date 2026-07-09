import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFederalGrants } from "@/lib/grants/federal/fetchFederalGrants";
import { normalizeFederalGrant } from "@/lib/grants/federal/normalizeFederalGrant";

export async function POST() {
  try {
    const rawGrants = await fetchFederalGrants();

    const normalized = rawGrants.map((g: any) => normalizeFederalGrant(g));

    for (const grant of normalized) {
      await prisma.grant.upsert({
        where: {
          // Federal grants use opportunity number as unique key
          id: grant.raw?.opportunityNumber || grant.title,
        },
        update: grant,
        create: {
          id: grant.raw?.opportunityNumber || grant.title,
          ...grant,
        },
      });
    }

    return NextResponse.json({
      count: normalized.length,
      status: "Federal grants ingested successfully",
    });
  } catch (error: any) {
    console.error("Federal ingestion error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFoundations } from "@/lib/grants/foundations/fetchFoundations";
import { normalizeFoundation } from "@/lib/grants/foundations/normalizeFoundation";

export async function POST() {
  try {
    const rawFoundations = await fetchFoundations();
    const normalized = rawFoundations.map((f: any) =>
      normalizeFoundation(f)
    );

    for (const grant of normalized) {
      await prisma.grant.upsert({
        where: {
          id: grant.foundationEIN || grant.title,
        },
        update: grant,
        create: {
          id: grant.foundationEIN || grant.title,
          ...grant,
        },
      });
    }

    return NextResponse.json({
      count: normalized.length,
      status: "Private foundations ingested successfully",
    });
  } catch (error: any) {
    console.error("Foundation ingestion error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

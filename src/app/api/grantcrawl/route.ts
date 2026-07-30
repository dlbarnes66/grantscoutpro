import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      category,
      agency,
      summary,
      amount,
      amountMin,
      amountMax,
      totalFunding,
      awardFloor,
      awardCeiling,
      expectedAwards,
      industry,
      location
    } = body;

    const grant = await prisma.grant.create({
      data: {
        workspaceId: "default", // replace with real workspaceId
        title,
        description,
        category,
        agency,
        summary,
        status: "open",

        // Financial fields that actually exist in your schema
        amount,
        amountMin,
        amountMax,
        totalFunding,
        awardFloor,
        awardCeiling,
        expectedAwards,

        // Metadata fields that exist
        industry,
        location,

        // Required fields
        embedding: []
      }
    });

    return NextResponse.json({ success: true, grant });
  } catch (err: any) {
    console.error("GRANT CRAWL ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

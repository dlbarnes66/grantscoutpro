import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GrantSource, GrantTierAccess } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const normalized = body.normalizedGrant;
    const workspaceId = body.workspaceId; // ⭐ REQUIRED

    if (!normalized?.id) {
      return NextResponse.json(
        { error: "Missing normalized grant ID" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const grantData = {
      id: normalized.id,
      workspaceId, // ⭐ REQUIRED FIELD

      source: GrantSource.FEDERAL,
      tierAccess: GrantTierAccess.FEDERAL_ONLY,

      title: normalized.title,
      summary: normalized.summary ?? null,
      description: normalized.description ?? null,
      category: normalized.category ?? null,
      agency: normalized.agency ?? null,

      amount: normalized.amount ?? null,
      amountMin: normalized.amountMin ?? null,
      amountMax: normalized.amountMax ?? null,
      totalFunding: normalized.totalFunding ?? null,

      deadline: normalized.deadline ?? null,
      industry: normalized.industry ?? null,
      location: normalized.location ?? null,

      raw: normalized.raw as Record<string, any>
    };

    const upserted = await prisma.grant.upsert({
      where: { id: normalized.id },
      create: grantData,
      update: grantData
    });

    return NextResponse.json({ success: true, grant: upserted });
  } catch (err: any) {
    console.error("FEDERAL INGEST ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

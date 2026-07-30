import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GrantSource, GrantTierAccess } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const grant = body.grant;
    const workspaceId = body.workspaceId;

    if (!grant?.id) {
      return NextResponse.json(
        { error: "Missing grant ID" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const upserted = await prisma.grant.upsert({
      where: { id: grant.id },
      update: {
        title: grant.title ?? null,
        summary: grant.summary ?? null,
        description: grant.description ?? null,
        category: grant.category ?? null,
        agency: grant.agency ?? null,

        amount: grant.amount ?? null,
        amountMin: grant.amountMin ?? null,
        amountMax: grant.amountMax ?? null,
        totalFunding: grant.totalFunding ?? null,

        deadline: grant.deadline ?? null,
        industry: grant.industry ?? null,
        location: grant.location ?? null,

        // fundingRange removed — not in Prisma model

        raw: grant
      },
      create: {
        id: grant.id,
        workspaceId,
        source: GrantSource.STATE,          // ⭐ FIXED
        tierAccess: GrantTierAccess.PRO,

        title: grant.title ?? null,
        summary: grant.summary ?? null,
        description: grant.description ?? null,
        category: grant.category ?? null,
        agency: grant.agency ?? null,

        amount: grant.amount ?? null,
        amountMin: grant.amountMin ?? null,
        amountMax: grant.amountMax ?? null,
        totalFunding: grant.totalFunding ?? null,

        deadline: grant.deadline ?? null,
        industry: grant.industry ?? null,
        location: grant.location ?? null,

        // fundingRange removed — not in Prisma model

        raw: grant
      }
    });

    return NextResponse.json({ success: true, grant: upserted });
  } catch (err: any) {
    console.error("STATE INGEST ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

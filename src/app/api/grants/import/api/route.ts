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
        title: grant.title ?? "",
        summary: grant.summary ?? "",
        description: grant.description ?? "",
        category: grant.category ?? "",
        agency: grant.agency ?? "",

        amount: grant.amount ?? null,
        amountMin: grant.amountMin ?? null,
        amountMax: grant.amountMax ?? null,
        totalFunding: grant.totalFunding ?? null,

        deadline: grant.deadline ?? null,
        industry: grant.industry ?? "",
        location: grant.location ?? "",

        // fundingRange removed — not in Prisma model

        raw: grant
      },
      create: {
        id: grant.id,
        source: GrantSource.FEDERAL,
        tierAccess: GrantTierAccess.PRO,

        title: grant.title ?? "",
        summary: grant.summary ?? "",
        description: grant.description ?? "",
        category: grant.category ?? "",
        agency: grant.agency ?? "",

        amount: grant.amount ?? null,
        amountMin: grant.amountMin ?? null,
        amountMax: grant.amountMax ?? null,
        totalFunding: grant.totalFunding ?? null,

        deadline: grant.deadline ?? null,
        industry: grant.industry ?? "",
        location: grant.location ?? "",

        // fundingRange removed — not in Prisma model

        workspace: { connect: { id: workspaceId } },
        raw: grant
      }
    });

    return NextResponse.json({ success: true, grant: upserted });
  } catch (err: any) {
    console.error("IMPORT API ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GrantSource, GrantTierAccess } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const items = body.items;
    const workspaceId = body.workspaceId;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid RSS items array" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.id) continue;

      const grant = {
        id: item.id,
        title: item.title ?? "",
        summary: item.summary ?? "",
        description: item.description ?? "",
        category: item.category ?? "",
        agency: item.agency ?? "",
        amount: item.amount ?? null,
        amountMin: item.amountMin ?? null,
        amountMax: item.amountMax ?? null,
        totalFunding: item.totalFunding ?? null,
        deadline: item.deadline ?? null,
        industry: item.industry ?? "",
        location: item.location ?? "",
        raw: item
      };

      await prisma.grant.upsert({
        where: { id: grant.id },
        update: {
          title: grant.title,
          summary: grant.summary,
          description: grant.description,
          category: grant.category,
          agency: grant.agency,

          amount: grant.amount,
          amountMin: grant.amountMin,
          amountMax: grant.amountMax,
          totalFunding: grant.totalFunding,

          deadline: grant.deadline,
          industry: grant.industry,
          location: grant.location,

          // fundingRange removed — not in Prisma model

          status: "open",
          embedding: [],

          raw: grant.raw
        },
        create: {
          id: grant.id,
          workspaceId,
          source: GrantSource.STATE,
          tierAccess: GrantTierAccess.PRO,

          title: grant.title,
          summary: grant.summary,
          description: grant.description,
          category: grant.category,
          agency: grant.agency,

          amount: grant.amount,
          amountMin: grant.amountMin,
          amountMax: grant.amountMax,
          totalFunding: grant.totalFunding,

          deadline: grant.deadline,
          industry: grant.industry,
          location: grant.location,

          // fundingRange removed — not in Prisma model

          status: "open",
          embedding: [],

          raw: grant.raw
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("RSS SCRAPER ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

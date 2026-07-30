import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GrantSource, GrantTierAccess } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const grants = body.grants;
    const workspaceId = body.workspaceId;

    if (!Array.isArray(grants)) {
      return NextResponse.json(
        { error: "Invalid grants array" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    for (const grant of grants) {
      if (!grant.id) continue;

      await prisma.grant.upsert({
        where: { id: grant.id },
        update: {
          title: grant.title || "",
          summary: grant.summary || "",
          description: grant.description || "",
          category: grant.category || "",
          agency: grant.agency || "",

          amount: grant.amount ?? null,
          amountMin: grant.amountMin ?? null,
          amountMax: grant.amountMax ?? null,
          totalFunding: grant.totalFunding ?? null,

          deadline: grant.deadline ?? null,
          industry: grant.industry || "",
          location: grant.location || "",

          // fundingRange removed — not in Prisma model

          status: grant.status || "open",
          embedding: [],

          raw: grant
        },
        create: {
          id: grant.id,
          workspaceId,
          source: GrantSource.STATE,
          tierAccess: GrantTierAccess.PRO,

          title: grant.title || "",
          summary: grant.summary || "",
          description: grant.description || "",
          category: grant.category || "",
          agency: grant.agency || "",

          amount: grant.amount ?? null,
          amountMin: grant.amountMin ?? null,
          amountMax: grant.amountMax ?? null,
          totalFunding: grant.totalFunding ?? null,

          deadline: grant.deadline ?? null,
          industry: grant.industry || "",
          location: grant.location || "",

          // fundingRange removed — not in Prisma model

          status: grant.status || "open",
          embedding: [],

          raw: grant
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SCRAPER IMPORT ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

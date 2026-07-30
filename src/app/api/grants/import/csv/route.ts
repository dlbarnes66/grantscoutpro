import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GrantSource, GrantTierAccess } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rows = body.rows;
    const workspaceId = body.workspaceId;

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Invalid CSV rows" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    for (const row of rows) {
      if (!row.id) continue;

      await prisma.grant.upsert({
        where: { id: row.id },
        update: {
          title: row.title ?? "",
          summary: row.summary ?? "",
          description: row.description ?? "",
          category: row.category ?? "",
          agency: row.agency ?? "",

          amount: row.amount ?? null,
          amountMin: row.amountMin ?? null,
          amountMax: row.amountMax ?? null,
          totalFunding: row.totalFunding ?? null,

          deadline: row.deadline ?? null,
          industry: row.industry ?? "",
          location: row.location ?? "",

          // fundingRange removed — not in Prisma model

          raw: row
        },
        create: {
          id: row.id,
          source: GrantSource.FEDERAL,
          tierAccess: GrantTierAccess.PRO,

          title: row.title ?? "",
          summary: row.summary ?? "",
          description: row.description ?? "",
          category: row.category ?? "",
          agency: row.agency ?? "",

          amount: row.amount ?? null,
          amountMin: row.amountMin ?? null,
          amountMax: row.amountMax ?? null,
          totalFunding: row.totalFunding ?? null,

          deadline: row.deadline ?? null,
          industry: row.industry ?? "",
          location: row.location ?? "",

          // fundingRange removed — not in Prisma model

          workspace: { connect: { id: workspaceId } },
          raw: row
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("CSV IMPORT ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

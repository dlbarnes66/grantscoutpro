import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const grant = body.grant;
    const ai = body.ai;
    const embedding = body.embedding;
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

    const deduped = {
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

      raw: grant
    };

    const upserted = await prisma.grant.upsert({
      where: { id: grant.id },
      update: {
        ...deduped,
        aiSummary: ai.aiSummary ?? null,
        // aiInsights removed — not in Prisma model
        embedding
      },
      create: {
        id: grant.id,
        workspaceId,
        source: grant.source ?? "FEDERAL",
        tierAccess: grant.tierAccess ?? "PRO",

        ...deduped,
        aiSummary: ai.aiSummary ?? null,
        // aiInsights removed — not in Prisma model
        embedding
      }
    });

    return NextResponse.json({ success: true, grant: upserted });
  } catch (err: any) {
    console.error("GRANT INGEST ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GrantSource, GrantTierAccess } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const html = body.html;
    const workspaceId = body.workspaceId;

    if (!html) {
      return NextResponse.json(
        { error: "Missing HTML content" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    // Example parsed grant (your actual parsing logic may differ)
    const grant = {
      id: body.id,
      title: body.title ?? "",
      summary: body.summary ?? "",
      description: body.description ?? "",
      category: body.category ?? "",
      agency: body.agency ?? "",
      amount: body.amount ?? null,
      amountMin: body.amountMin ?? null,
      amountMax: body.amountMax ?? null,
      totalFunding: body.totalFunding ?? null,
      deadline: body.deadline ?? null,
      industry: body.industry ?? "",
      location: body.location ?? "",
      raw: { html }
    };

    const upserted = await prisma.grant.upsert({
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

    return NextResponse.json({ success: true, grant: upserted });
  } catch (err: any) {
    console.error("HTML SCRAPER ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

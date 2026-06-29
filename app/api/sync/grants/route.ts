import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { grants } = await req.json();

    if (!grants || !Array.isArray(grants)) {
      return NextResponse.json({ error: "Missing grants array" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;

    for (const g of grants) {
      const existing = await prisma.grant.findUnique({
        where: { externalId: g.externalId },
      });

      if (existing) {
        await prisma.grant.update({
          where: { id: existing.id },
          data: {
            title: g.title,
            description: g.description,
            category: g.category,
            deadline: g.deadline ? new Date(g.deadline) : null,
            industry: g.industry,
            location: g.location,
            fundingRange: g.fundingRange,
          },
        });
        updated++;
      } else {
        await prisma.grant.create({
          data: {
            externalId: g.externalId,
            title: g.title,
            description: g.description,
            category: g.category,
            deadline: g.deadline ? new Date(g.deadline) : null,
            industry: g.industry,
            location: g.location,
            fundingRange: g.fundingRange,
          },
        });
        created++;
      }
    }

    return NextResponse.json({ created, updated });
  } catch (err: any) {
    console.error("Grant sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    for (const g of grants) {
      await prisma.grant.create({
        data: {
          externalId: g.externalId ?? `${Math.random()}`,
          title: g.title,
          description: g.description,
          category: g.category ?? "",
          deadline: g.deadline ? new Date(g.deadline) : null,
          industry: g.industry ?? "",
          location: g.location ?? "",
          fundingRange: g.fundingRange ?? "",
        },
      });

      created++;
    }

    return NextResponse.json({ created });
  } catch (err: any) {
    console.error("Import pipeline error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

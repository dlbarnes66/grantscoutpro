import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const response = await fetch(url);
    const data = await response.json();

    let imported = 0;

    for (const grant of data) {
      await prisma.grant.create({
        data: {
          externalId: grant.id ?? `${url}-${Math.random()}`,
          title: grant.title,
          description: grant.description,
          category: grant.category ?? "",
          deadline: grant.deadline ? new Date(grant.deadline) : null,
          industry: grant.industry ?? "",
          location: grant.location ?? "",
          fundingRange: grant.fundingRange ?? "",
        },
      });

      imported++;
    }

    return NextResponse.json({ imported });
  } catch (err: any) {
    console.error("JSON scraper error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

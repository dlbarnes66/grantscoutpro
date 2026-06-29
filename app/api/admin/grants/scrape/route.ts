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

    const imported = [];

    for (const grant of data) {
      const created = await prisma.grant.create({
        data: {
          title: grant.title,
          description: grant.description,
          category: grant.category,
          deadline: new Date(grant.deadline),
          industry: grant.industry ?? "",
          location: grant.location ?? "",
          fundingRange: grant.fundingRange ?? "",
        },
      });

      imported.push(created);
    }

    return NextResponse.json({ imported });
  } catch (err: any) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

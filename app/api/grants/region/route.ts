import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { region } = await req.json();

    if (!region) {
      return NextResponse.json({ error: "Missing region" }, { status: 400 });
    }

    const grants = await prisma.grant.findMany({
      where: {
        location: { contains: region, mode: "insensitive" },
      },
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({ grants });
  } catch (err: any) {
    console.error("Region grants error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

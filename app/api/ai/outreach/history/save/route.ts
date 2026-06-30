import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, funderId, result } = await req.json();

    if (!userId || !funderId || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const entry = await prisma.outreachHistory.create({
      data: {
        userId,
        funderId,
        result
      }
    });

    return NextResponse.json({ saved: true, entry });
  } catch (err: any) {
    console.error("Outreach history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

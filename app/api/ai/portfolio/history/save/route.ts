import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, result } = await req.json();

    if (!userId || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const entry = await prisma.portfolioHistory.create({
      data: {
        userId,
        result
      }
    });

    return NextResponse.json({ saved: true, entry });
  } catch (err: any) {
    console.error("Portfolio history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

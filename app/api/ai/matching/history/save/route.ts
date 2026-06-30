import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, results } = await req.json();

    if (!userId || !results) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const entry = await prisma.matchHistory.create({
      data: {
        userId,
        results
      }
    });

    return NextResponse.json({ saved: true, entry });
  } catch (err: any) {
    console.error("Match history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

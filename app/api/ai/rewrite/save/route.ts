import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, grantId, original, rewritten, tone } = await req.json();

    if (!userId || !grantId || !original || !rewritten || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry = await prisma.rewriteHistory.create({
      data: {
        userId,
        grantId,
        original,
        rewritten,
        tone,
      },
    });

    return NextResponse.json({ saved: true, entry });
  } catch (err: any) {
    console.error("Rewrite save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

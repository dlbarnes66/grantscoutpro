export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { userId, grantId, original, rewritten, tone } = await req.json();

    if (!userId || !grantId) {
      return NextResponse.json(
        { error: "Missing userId or grantId" },
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

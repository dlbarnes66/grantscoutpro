import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, grantId, probability, notes } = await req.json();

    if (!userId || !grantId || probability === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const entry = await prisma.successProbabilityHistory.create({
      data: { userId, grantId, probability, notes },
    });

    return NextResponse.json({ saved: true, entry });
  } catch (err: any) {
    console.error("Success probability save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

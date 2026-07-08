import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, grantId, status, notes } = await req.json();

    if (!userId || !grantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const app = await prisma.submissionHistory.create({
      data: {
        userId,
        grantId,
        status: status ?? "started",
        notes,
        submittedAt: null,
      },
    });

    return NextResponse.json({ started: true, app });
  } catch (err: any) {
    console.error("Application start error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

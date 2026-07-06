import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, grantId, status, notes } = await req.json();

    if (!userId || !grantId) {
      return NextResponse.json(
        { error: "Missing userId or grantId" },
        { status: 400 }
      );
    }

    const edit = await prisma.applicationHistory.create({
      data: {
        userId,
        grantId,
        status,
        notes,
      },
    });

    return NextResponse.json({ edit });
  } catch (err: any) {
    console.error("Collab edit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
